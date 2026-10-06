import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

interface Props {
  /** Stable, language-independent key (used by tests). */
  id: string;
  title: string;
  icon: LucideIcon;
  className?: string;
  titleClassName?: string;
  iconClassName?: string;
  children: ReactNode;
}

/** The single flat card used by every content section: title row (icon + title) then content. */
export default function SectionCard({ id, title, icon: Icon, className = "bg-card ring-ink/10", titleClassName = "text-leaf-deep", iconClassName, children }: Props) {
  return (
    <section className={`rounded-2xl p-4 ring-1 sm:p-5 ${className}`} data-section={id}>
      <h3 className={`mb-3 flex items-center gap-2 text-[15px] font-bold ${titleClassName}`}>
        <Icon className={`size-[18px] shrink-0 ${iconClassName ?? ""}`} aria-hidden="true" />
        <span>{title}</span>
      </h3>
      {children}
    </section>
  );
}
