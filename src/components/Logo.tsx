interface Props {
  size?: "sm" | "lg";
  className?: string;
}

/** Wordmark «على بصيرة» in classical Arabic (Amiri) over an eight-point star. */
export default function Logo({ size = "sm", className = "" }: Props) {
  const lg = size === "lg";
  return (
    <span className={`inline-flex items-center gap-3 ${className}`} aria-label="على بصيرة" role="img" lang="ar" dir="rtl">
      <svg viewBox="0 0 64 64" className={lg ? "size-16 sm:size-20" : "size-10"} aria-hidden="true">
        <g fill="none" stroke="currentColor" strokeWidth="2.2" className="text-saffron">
          <rect x="14" y="14" width="36" height="36" rx="3" />
          <rect x="14" y="14" width="36" height="36" rx="3" transform="rotate(45 32 32)" />
        </g>
        <circle cx="32" cy="32" r="9" className="fill-leaf" />
        <circle cx="32" cy="32" r="3.2" className="fill-cream" />
      </svg>
      <span className={`font-display leading-[1.35] font-bold ${lg ? "text-6xl sm:text-8xl" : "text-3xl"}`} aria-hidden="true">
        عَلَى بَصِيرَة
      </span>
    </span>
  );
}
