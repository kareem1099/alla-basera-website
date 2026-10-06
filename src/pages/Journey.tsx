import { useCallback, useRef, useState } from "react";
import CompanionChat from "../components/CompanionChat";
import DayCard from "../components/DayCard";
import Header from "../components/Header";
import UnitsBar from "../components/UnitsBar";
import { journeyFor, type Unit } from "../data/journey";
import { useLang } from "../lib/i18n";

export default function Journey() {
  const { lang } = useLang();
  const { days, units } = journeyFor(lang);
  const totalDays = days.length;
  const getDay = (n: number) => days[Math.min(Math.max(n, 1), totalDays) - 1];
  const getUnitOfDay = (n: number) => units.find((u) => n >= u.startDay && n <= u.endDay) ?? units[0];
  const [activeDay, setActiveDay] = useState(1);
  const [actionsDone, setActionsDone] = useState<Record<number, boolean>>({});
  const cardRef = useRef<HTMLDivElement>(null);

  const day = getDay(activeDay);
  const unit = getUnitOfDay(activeDay);

  const goTo = useCallback(
    (n: number) => {
      const target = Math.min(Math.max(n, 1), totalDays);
      setActiveDay(target);
      requestAnimationFrame(() => {
        const top = (cardRef.current?.getBoundingClientRect().top ?? 0) + window.scrollY - 16;
        window.scrollTo({ top: Math.max(0, top), behavior: "smooth" });
      });
    },
    [totalDays],
  );

  return (
    <div className="min-h-screen bg-cream text-ink">
      <Header activeDay={activeDay} totalDays={totalDays} />
      <UnitsBar
        units={units}
        currentUnit={unit}
        activeDay={activeDay}
        totalDays={totalDays}
        onSelectUnit={(u: Unit) => goTo(u.startDay)}
        onSelectDay={goTo}
      />
      <main className="mx-auto grid max-w-[1440px] gap-6 px-4 py-6 sm:px-6 lg:grid-cols-12">
        <div ref={cardRef} className="min-w-0 lg:col-span-7">
          <DayCard
            key={`${lang}-${day.day}`}
            day={day}
            isLast={activeDay === totalDays}
            actionDone={!!actionsDone[day.day]}
            onToggleAction={() => setActionsDone((m) => ({ ...m, [day.day]: !m[day.day] }))}
            onNext={() => goTo(activeDay + 1)}
          />
        </div>
        <div className="min-w-0 lg:col-span-5">
          <CompanionChat key={`${lang}-${day.day}`} day={day} />
        </div>
      </main>
    </div>
  );
}
