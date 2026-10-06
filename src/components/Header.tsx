import { LangToggle, useLang } from "../lib/i18n";

interface Props {
  activeDay: number;
  totalDays: number;
}

export default function Header({ activeDay, totalDays }: Props) {
  const { t, num, lang } = useLang();
  return (
    <header className="border-b-2 border-ink/10 bg-cream/95">
      <div className="mx-auto flex max-w-[1440px] items-center gap-3 px-4 py-3 sm:px-6">
        <a
          href="#/"
          aria-label={t.homeAria}
          className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-leaf font-display text-xl font-bold text-white hover:bg-leaf-deep"
          lang="ar"
        >
          بصيرة
        </a>
        <div className="min-w-0">
          <p className={`truncate text-lg font-bold leading-tight sm:text-xl ${lang === "ar" ? "font-display" : ""}`}>{t.bookName}</p>
          <p className="text-xs text-ink/50 sm:text-sm">{t.journeySubtitle(num(totalDays))}</p>
        </div>
        <div className="ms-auto flex items-center gap-2">
          <div className="hidden shrink-0 items-center gap-1.5 rounded-full bg-paper px-3 py-1.5 text-sm ring-1 ring-ink/10 sm:flex" aria-label={t.dayNofM(activeDay, totalDays)}>
            <span className="text-ink/60">{t.day}</span>
            <span className="font-display text-lg font-bold leading-none text-leaf-deep">{num(activeDay)}</span>
            <span className="text-ink/60">{t.of}</span>
            <span className="font-semibold">{num(totalDays)}</span>
          </div>
          <LangToggle />
        </div>
      </div>
    </header>
  );
}
