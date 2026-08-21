/**
 * One measurement of the page per animation frame, shared by everything that
 * needs it.
 *
 * The chrome that reacts to scrolling used to measure independently: the nav
 * rail ran its own `scroll` listener, the scroll cue ran a second one plus a
 * `ResizeObserver` on `document.body`, and each of them opened with
 * `document.querySelector(".hero-fold")` followed by `getBoundingClientRect()`.
 * Both were handlers on the raw `scroll` event, which the browser can dispatch
 * more than once per frame — so a single flick of the wheel could force the
 * layout to be flushed several times over, for two readings of the same number.
 *
 * Now there is one listener, one `rAF` gate, one query and one rect per frame,
 * fanned out to every subscriber. The reading is deliberately a plain snapshot
 * of numbers rather than element references: subscribers compare and bail, so a
 * frame where nothing crossed a threshold costs no React work at all.
 */

export interface ViewportReading {
  /** Distance from the top of the viewport to the foot of `.hero-fold`, or
      -1 on a page that has no fold. */
  heroBottom: number;
  scrollTop: number;
  scrollHeight: number;
  clientHeight: number;
}

type Listener = (reading: ViewportReading) => void;

const listeners = new Set<Listener>();
let frame = 0;
let bound = false;
let bodyObserver: ResizeObserver | null = null;

function measure(): ViewportReading {
  const doc = document.documentElement;
  const fold = document.querySelector(".hero-fold");
  return {
    heroBottom: fold ? fold.getBoundingClientRect().bottom : -1,
    scrollTop: doc.scrollTop,
    scrollHeight: doc.scrollHeight,
    clientHeight: doc.clientHeight,
  };
}

/* Every event funnels through here, so a scroll that fires three times before
   the next paint still measures once. */
function schedule() {
  if (frame) return;
  frame = requestAnimationFrame(() => {
    frame = 0;
    const reading = measure();
    for (const listener of listeners) listener(reading);
  });
}

function bind() {
  if (bound) return;
  bound = true;
  window.addEventListener("scroll", schedule, { passive: true });
  window.addEventListener("resize", schedule);
  /* Late layout — a font swap, the hero video's first frame, an image
     arriving — changes the page height without any scroll or resize event.
     The callback only schedules, so this cannot re-enter: it queues a frame,
     the frame reads, and reading writes nothing back into layout. */
  bodyObserver = new ResizeObserver(schedule);
  bodyObserver.observe(document.body);
}

function unbind() {
  if (!bound) return;
  bound = false;
  window.removeEventListener("scroll", schedule);
  window.removeEventListener("resize", schedule);
  bodyObserver?.disconnect();
  bodyObserver = null;
  if (frame) cancelAnimationFrame(frame);
  frame = 0;
}

/**
 * Watch the page. Returns the unsubscribe. The first reading arrives on the
 * next frame; call `refreshViewport()` for one sooner (after a route change,
 * say, where the new page's layout decides both flags afresh).
 */
export function observeViewport(listener: Listener): () => void {
  listeners.add(listener);
  bind();
  schedule();
  return () => {
    listeners.delete(listener);
    if (listeners.size === 0) unbind();
  };
}

/** Force a fresh reading on the next frame. */
export function refreshViewport() {
  if (listeners.size) schedule();
}
