// Official ASFOCMD seal — black line-art on light surfaces, white knockout
// on dark ones (tone="footer"). Sourced from /brand/asfoc-seal-*.png.
export default function Logo({
  size = 42,
  tone = "dark",
}: {
  size?: number;
  tone?: "dark" | "footer";
}) {
  const src =
    tone === "footer"
      ? "/brand/asfoc-seal-white-512.png"
      : "/brand/asfoc-seal-512.png";
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
