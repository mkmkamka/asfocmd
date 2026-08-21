// Official ASFOCMD seal — the full mark: ring, ribbon, ASFOCMD + MOLDOVA,
// brick chimney, ladder, brush, smoke and fire.
//
// The artwork is generated. Edit tools/seal/gen.py and re-run it; never edit
// the SVGs in /public/brand by hand.
const FILE = {
  dark: "asfoc-seal",
  mono: "asfoc-seal-mono",
  footer: "asfoc-seal-white",
} as const;

export default function Logo({
  size = 42,
  tone = "dark",
}: {
  size?: number;
  /**
   * "footer" is the white knockout, for dark grounds.
   * "mono" is the greyscale cut, for the resting half of a hover swap.
   */
  tone?: keyof typeof FILE;
}) {
  const src = `/brand/${FILE[tone]}.svg`;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      width={size}
      height={size}
      alt=""
      aria-hidden="true"
      style={{ display: "block" }}
    />
  );
}
