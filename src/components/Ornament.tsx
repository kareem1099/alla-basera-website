import type { ReactNode } from "react";

/** Points of an eight-point star (two overlapping squares, as in the logo) in a 100×100 box. */
const STAR = Array.from({ length: 16 }, (_, k) => {
  const r = k % 2 === 0 ? 50 : 50 * (Math.SQRT1_2 / Math.cos(Math.PI / 8));
  const a = (k * Math.PI) / 8 - Math.PI / 2;
  return `${(50 + r * Math.cos(a)).toFixed(2)},${(50 + r * Math.sin(a)).toFixed(2)}`;
}).join(" ");

interface StarProps {
  className?: string;
  /** Tailwind fill/stroke classes for the star body. */
  shape?: string;
  children?: ReactNode;
}

/** An eight-point star medallion with centred content (a number, a glyph). */
export function StarMedallion({ className = "size-12", shape = "fill-cream stroke-saffron", children }: StarProps) {
  return (
    <span className={`relative inline-flex shrink-0 items-center justify-center ${className}`}>
      <svg viewBox="-4 -4 108 108" className="absolute inset-0 size-full" aria-hidden="true">
        <polygon points={STAR} className={shape} strokeWidth="5" strokeLinejoin="round" />
      </svg>
      <span className="relative leading-none">{children}</span>
    </span>
  );
}

/** Outline star used as a faint corner watermark. */
export function StarOutline({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="1.3">
      <rect x="14" y="14" width="36" height="36" />
      <rect x="14" y="14" width="36" height="36" transform="rotate(45 32 32)" />
      <circle cx="32" cy="32" r="9" />
      <circle cx="32" cy="32" r="22" />
    </svg>
  );
}

/** A centred hairline divider with a small star in the middle. */
export function Divider({ className = "", tone = "text-saffron" }: { className?: string; tone?: string }) {
  return (
    <div className={`flex items-center justify-center gap-3 ${tone} ${className}`} aria-hidden="true">
      <span className="h-px w-16 bg-gradient-to-l from-current to-transparent opacity-70 rtl:bg-gradient-to-r" />
      <svg viewBox="0 0 24 24" className="size-3.5">
        <polygon points="12,1 14.6,7.2 21.2,5.6 17.6,11.4 23,15 16.4,15.6 15.8,22.4 12,17 8.2,22.4 7.6,15.6 1,15 6.4,11.4 2.8,5.6 9.4,7.2" fill="currentColor" />
      </svg>
      <span className="h-px w-16 bg-gradient-to-r from-current to-transparent opacity-70 rtl:bg-gradient-to-l" />
    </div>
  );
}

/** Repeating geometric lattice (same motif as the home page), drawn in currentColor. */
export const latticeBg = (color = "%23333", size = 80) =>
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 80 80'%3E%3Cg fill='none' stroke='${color}' stroke-width='1.2'%3E%3Crect x='22' y='22' width='36' height='36'/%3E%3Crect x='22' y='22' width='36' height='36' transform='rotate(45 40 40)'/%3E%3C/g%3E%3C/svg%3E")`;
