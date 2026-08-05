"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

type Img = { src: string; alt: string };

/* In-page image viewer. The trigger stays a real <a href> (so existing
   `.a-gallery a` / `.scan-card` / `.photo-tile` CSS and no-JS behavior keep
   working) but clicks open an overlay instead of a new tab: big ✕ button,
   Esc, backdrop click, and ‹ › keys/arrows when the group has several
   images. */
export function Lightbox({
  images,
  index,
  className,
  children,
}: {
  images: Img[];
  index: number;
  className?: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  const [cur, setCur] = useState(index);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  const step = useCallback(
    (dir: number) =>
      setCur((c) => (c + dir + images.length) % images.length),
    [images.length],
  );

  useEffect(() => {
    if (!open) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, step]);

  return (
    <>
      <a
        href={images[index].src}
        className={className}
        onClick={(e) => {
          e.preventDefault();
          setCur(index);
          setOpen(true);
        }}
      >
        {children}
      </a>
      {open &&
        createPortal(
          <div
            role="dialog"
            aria-modal="true"
            aria-label={images[cur].alt}
            className="fixed inset-0 z-[120] flex items-center justify-center bg-[#101114]/90 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={images[cur].src}
              alt={images[cur].alt}
              className="max-h-[86vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <button
              ref={closeRef}
              type="button"
              aria-label="Close"
              className="absolute right-4 top-4 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-2xl leading-none text-white transition-colors hover:bg-white/25 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
              onClick={() => setOpen(false)}
            >
              ✕
            </button>
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  aria-label="Previous"
                  className="absolute left-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/25"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(-1);
                  }}
                >
                  ‹
                </button>
                <button
                  type="button"
                  aria-label="Next"
                  className="absolute right-3 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-2xl text-white transition-colors hover:bg-white/25"
                  onClick={(e) => {
                    e.stopPropagation();
                    step(1);
                  }}
                >
                  ›
                </button>
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold text-white">
                  {cur + 1} / {images.length}
                </div>
              </>
            )}
          </div>,
          document.body,
        )}
    </>
  );
}
