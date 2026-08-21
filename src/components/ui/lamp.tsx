import { cn } from "@/lib/utils";

/**
 * The tubelight lamp: a short bar of light resting on the top edge of whatever
 * it is lighting, with three blurred halos spilling out of it.
 *
 * It was written out three times — once in the nav pill, once in the membership
 * button, and it was about to be written a fourth time for the hero's actions.
 * Same six nodes, same offsets, three sets of hand-tuned halo colours drifting
 * apart. One component now, with the colour as a parameter, because the whole
 * point of the mark is that a lit thing on this site is lit the same way
 * wherever it appears.
 *
 * The halos are `blur()` filters, so keep this off anything that repaints on
 * every frame; it is meant for the handful of lit surfaces in the chrome.
 */
export function Lamp({
  color,
  halo,
  className,
}: {
  /** The bar itself — full strength. */
  color: string;
  /** The bloom around it. Usually the bar's hue at ~20-25% alpha. */
  halo: string;
  className?: string;
}) {
  return (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-1/2 h-1 w-8 -translate-x-1/2 rounded-t-full",
        className,
      )}
      /* The offset is an inline style rather than a `-top-2` utility so a host
         can move the light without fighting Tailwind's utilities layer, which
         outranks anything a stylesheet rule can say about it. The hero's two
         bordered capsules use it to sit their lamps 1px higher, in line with
         the borderless one between them. */
      style={{ top: "var(--lamp-offset, -0.5rem)", background: color }}
    >
      <span
        className="absolute -left-2 -top-2 h-6 w-12 rounded-full blur-md"
        style={{ background: halo }}
      />
      <span
        className="absolute -top-1 h-6 w-8 rounded-full blur-md"
        style={{ background: halo }}
      />
      <span
        className="absolute left-2 top-0 h-4 w-4 rounded-full blur-sm"
        style={{ background: halo }}
      />
    </span>
  );
}
