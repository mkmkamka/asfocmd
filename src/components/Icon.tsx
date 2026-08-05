import type { CSSProperties } from "react";

export type IconName =
  | "phone" | "mail" | "shield" | "shieldCheck" | "badgeCheck" | "lock" | "globe"
  | "pin" | "pinSmall" | "grid" | "search" | "arrowRight" | "menu"
  | "svcSweep" | "svcStove" | "svcFireplace" | "svcChimney" | "svcHood"
  | "facebook" | "instagram" | "send"
  | "sun" | "moon"
  | "doc" | "image" | "clock" | "upload";

const paths: Record<IconName, React.ReactNode> = {
  phone: <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />,
  mail: <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="m22 6-10 7L2 6" /></>,
  shield: <path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z" />,
  shieldCheck: <><path d="M12 2 4 5v6c0 5 3.4 8.5 8 11 4.6-2.5 8-6 8-11V5z" /><path d="m9 12 2 2 4-4" /></>,
  badgeCheck: <><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><path d="m9 11 3 3L22 4" /></>,
  lock: <><rect x="3" y="8" width="18" height="12" rx="2" /><path d="M7 8V6a5 5 0 0 1 10 0v2" /></>,
  globe: <><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" /><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20" /></>,
  pin: <><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" /></>,
  pinSmall: <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />,
  grid: <><path d="M4 4h16v4H4z" /><path d="M4 12h16v8H4z" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m21 21-4.3-4.3" /></>,
  arrowRight: <path d="M5 12h14M13 6l6 6-6 6" />,
  menu: <path d="M3 12h18M3 6h18M3 18h18" />,
  svcSweep: <><path d="M8 21V10l4-3 4 3v11" /><path d="M14 4h2v4h-2z" /><path d="M4 21h16" /></>,
  svcStove: <><rect x="4" y="4" width="16" height="16" rx="2" /><path d="M8 20v2M16 20v2" /><path d="M12 9c1.5 1 1.5 2.5 0 3.5" /></>,
  svcFireplace: <><path d="M5 20h14V8H5z" /><path d="M9 20v-4a3 3 0 0 1 6 0v4" /><path d="M12 4c1.5 1.2 1.5 2.8 0 4" /></>,
  svcChimney: <><path d="M9 21V7l3-3 3 3v14" /><rect x="13" y="2" width="4" height="5" rx="1" /></>,
  svcHood: <><path d="M4 8h16l-2 5H6z" /><path d="M8 13v5M16 13v5M12 13v5" /></>,
  facebook: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
  instagram: <><rect x="2" y="2" width="20" height="20" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" /></>,
  send: <><path d="m22 2-7 20-4-9-9-4z" /><path d="M22 2 11 13" /></>,
  sun: <><circle cx="12" cy="12" r="4" /><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" /></>,
  moon: <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />,
  doc: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /><path d="M9 13h6M9 17h6" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="m21 15-5-5L5 21" /></>,
  clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
  upload: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><path d="m7 9 5-5 5 5" /><path d="M12 4v12" /></>,
};

const filled: IconName[] = ["facebook"];

export default function Icon({
  name,
  size = 20,
  style,
}: {
  name: IconName;
  size?: number;
  style?: CSSProperties;
}) {
  const isFilled = filled.includes(name);
  return (
    <svg
      className="ico"
      viewBox="0 0 24 24"
      width={size}
      height={size}
      style={style}
      fill={isFilled ? "currentColor" : "none"}
      stroke={isFilled ? "none" : "currentColor"}
      aria-hidden="true"
    >
      {paths[name]}
    </svg>
  );
}
