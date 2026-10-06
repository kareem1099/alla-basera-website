import { ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { Unit } from "../data/journey";
import { dayCountLabel } from "../lib/arabic";
import { useLang } from "../lib/i18n";

interface Props {
  units: Unit[];
  currentUnit: Unit;
  activeDay: number;
  totalDays: number;
  onSelectUnit: (u: Unit) => void;
  onSelectDay: (d: number) => void;
}

export default function UnitsBar({ units, currentUnit, activeDay, totalDays, onSelectUnit, onSelectDay }: Props) {
  const { t, num, lang } = useLang();
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const daysRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useEffect(() => {
    daysRef.current?.querySelector<HTMLElement>('[aria-current="true"]')?.scrollIntoView({ block: "nearest", inline: "center" });
  }, [activeDay]);

  const unitDays = Array.from({ length: currentUnit.dayCount }, (_, i) => currentUnit.startDay + i);
  const pct = Math.round((activeDay / totalDays) * 100);

  return (
    <div className="border-b border-ink/10 bg-paper/60">
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:gap-6">
        <div ref={wrapRef} className="relative w-full lg:w-[28rem]">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            aria-haspopup="listbox"
            aria-expanded={open}
            className="flex w-full items-center gap-3 rounded-xl bg-cream px-3 py-2 text-start ring-1 ring-ink/15"
          >
            <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-leaf font-bold text-white">{num(currentUnit.number)}</span>
            <span className="min-w-0 flex-1">
              <span className="block text-[11px] font-bold text-ink/45">{t.currentUnit}</span>
              <span className="block truncate font-bold">{currentUnit.title}</span>
            </span>
            <span className="shrink-0 text-sm font-semibold text-leaf-deep">{dayCountLabel(currentUnit.dayCount, lang)}</span>
            <ChevronDown className={`size-5 shrink-0 text-ink/50 transition-transform ${open ? "rotate-180" : ""}`} aria-hidden="true" />
          </button>
          {open && (
            <ul role="listbox" aria-label={t.units} className="absolute z-40 mt-2 max-h-[26rem] w-full overflow-y-auto rounded-xl bg-cream p-1.5 shadow-xl ring-1 ring-ink/15">
              {units.map((u) => {
                const sel = u.number === currentUnit.number;
                return (
                  <li key={u.number} role="option" aria-selected={sel}>
                    <button
                      type="button"
                      onClick={() => {
                        onSelectUnit(u);
                        setOpen(false);
                      }}
                      className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-start hover:bg-paper ${sel ? "bg-leaf/10" : ""}`}
                    >
                      <span className={`flex size-8 shrink-0 items-center justify-center rounded-lg text-sm font-bold ${sel ? "bg-leaf text-white" : "bg-paper"}`}>
                        {num(u.number)}
                      </span>
                      <span className="min-w-0 flex-1 text-sm font-semibold leading-snug">{u.title}</span>
                      <span className="shrink-0 rounded-full bg-paper px-2.5 py-0.5 text-xs text-ink/70">{dayCountLabel(u.dayCount, lang)}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="shrink-0 text-sm font-semibold text-ink/55">{t.unitDays}</span>
          <div ref={daysRef} className="flex min-w-0 gap-1.5 overflow-x-auto py-1" role="group" aria-label={t.unitDays}>
            {unitDays.map((d) => {
              const active = d === activeDay;
              return (
                <button
                  key={d}
                  type="button"
                  aria-current={active}
                  aria-label={`${t.day} ${d}`}
                  onClick={() => onSelectDay(d)}
                  className={`flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-shadow ${
                    active ? "bg-leaf text-white" : "bg-cream ring-1 ring-ink/15 hover:ring-leaf/50"
                  }`}
                >
                  {num(d)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="hidden shrink-0 items-center gap-2 lg:flex" aria-label={t.progress(pct)}>
          <div className="h-2.5 w-32 overflow-hidden rounded-full bg-ink/10">
            <div className="h-full rounded-full bg-saffron transition-[width]" style={{ width: `${pct}%` }} />
          </div>
          <span className="text-sm font-semibold text-ink/60">{num(pct)}{lang === "ar" ? "٪" : "%"}</span>
        </div>
      </div>
    </div>
  );
}
