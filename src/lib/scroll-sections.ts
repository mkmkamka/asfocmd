/**
 * Section-aware scrolling, shared by the corner scroll cue (click) and the
 * keyboard handler (arrow keys). Every band on every page is a `<section>`
 * (or the closing `<footer>`), so "the next thing down" is always something
 * concrete to aim at rather than a fixed pixel distance that lands mid-band.
 */

// Clears the floating nav rail; matches the `scroll-margin-top` the anchored
// sections already carry.
const NAV_CLEARANCE = 92;

function sectionTargets(): number[] {
  const bands = Array.from(
    document.querySelectorAll<HTMLElement>("section, footer"),
  ).filter((el) => el.offsetParent !== null || el.tagName === "FOOTER");

  return bands
    .map((el) => Math.max(0, el.getBoundingClientRect().top + window.scrollY - NAV_CLEARANCE))
    .sort((a, b) => a - b);
}

export function scrollToAdjacentSection(direction: "down" | "up") {
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const targets = sectionTargets();
  const current = window.scrollY;
  // A few pixels of slack: after landing on a section it sits at exactly its
  // own target, so a zero-slack comparison would just pick it again.
  const EPS = 8;

  if (direction === "down") {
    const next = targets.find((t) => t > current + EPS);
    window.scrollTo({ top: next ?? Math.max(current, max), behavior: "smooth" });
    return;
  }

  const above = targets.filter((t) => t < current - EPS);
  const prev = above.length ? above[above.length - 1] : 0;
  window.scrollTo({ top: prev, behavior: "smooth" });
}
