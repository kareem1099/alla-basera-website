import { ArrowLeft, CircleHelp, Lightbulb, PartyPopper, Quote, ScrollText, SpellCheck } from "lucide-react";
import type { Day } from "../data/journey";
import { isArabicText, useLang } from "../lib/i18n";
import ActionToggle from "./ActionToggle";
import EvidenceCards from "./EvidenceCards";
import Quiz from "./Quiz";
import SectionCard from "./SectionCard";

interface Props {
  day: Day;
  isLast: boolean;
  actionDone: boolean;
  onToggleAction: () => void;
  onNext: () => void;
}

export default function DayCard({ day, isLast, actionDone, onToggleAction, onNext }: Props) {
  const { t, num, lang } = useLang();
  const display = lang === "ar" ? "font-display" : "font-display-en";
  return (
    <article key={day.day} className="animate-fade-up rounded-3xl bg-cream p-5 ring-1 ring-ink/10 sm:p-8" data-day={day.day}>
      <div className="mb-4">
        <span className="inline-block rounded-full bg-saffron/20 px-3 py-1 text-sm font-bold text-leaf-deep">{t.day} {num(day.day)}</span>
      </div>

      <h1 className={`${display} text-4xl leading-tight font-bold break-words sm:text-5xl`}>{day.title}</h1>
      <p className="mt-2 text-sm text-ink/50">{day.unitTitle}</p>

      <div className="mt-6 flex flex-col gap-4">
        <SectionCard id="سؤال النهارده" title={t.qOfDay} icon={CircleHelp} className="bg-paper ring-ink/10">
          <p className={`${display} text-2xl leading-relaxed whitespace-pre-line`}>{day.question}</p>
        </SectionCard>

        <SectionCard id="المبدأ الأساسي" title={t.principle} icon={Lightbulb}>
          <p className={`${display} text-xl leading-loose whitespace-pre-line sm:text-2xl`}>{day.principle}</p>
        </SectionCard>

        <EvidenceCards day={day} />

        {day.misconception && (
          <SectionCard id="تصحيح مفهوم" title={t.misconception} icon={SpellCheck} className="bg-saffron/15 ring-saffron/30">
            {day.misconception.peopleSay && (
              <div className="mb-3">
                <p className="text-sm font-bold text-ink/50">{t.peopleSay}</p>
                <p className="leading-relaxed whitespace-pre-line text-ink/80">{day.misconception.peopleSay}</p>
              </div>
            )}
            <div>
              <p className="text-sm font-bold text-leaf-deep">{t.correctIs}</p>
              <p className="font-semibold leading-relaxed whitespace-pre-line">{day.misconception.correct}</p>
            </div>
          </SectionCard>
        )}

        <SectionCard id="درس اليوم" title={t.lesson} icon={ScrollText}>
          <div className="max-w-[68ch] space-y-3">
            {day.lesson.map((p, i) => (
              <p key={i} className="text-[17px] leading-[2] whitespace-pre-line">
                {p}
              </p>
            ))}
          </div>
        </SectionCard>

        {day.quote && (
          <SectionCard id="اقتباس من الكتاب" title={t.quote} icon={Quote} className="bg-paper ring-ink/10">
            {lang === "en" && isArabicText(day.quote) ? (

              <>

                <blockquote lang="ar" dir="rtl" className="border-s-4 border-leaf ps-4 font-display text-xl leading-loose whitespace-pre-line">{day.quote}</blockquote>

                <p className="mt-2 text-xs text-ink/55">{t.arabicOnly}</p>

              </>

            ) : (

              <blockquote className={`border-s-4 border-leaf ps-4 ${display} text-xl leading-loose whitespace-pre-line`}>{day.quote}</blockquote>

            )}
          </SectionCard>
        )}

        <ActionToggle text={day.action} checked={actionDone} onToggle={onToggleAction} />

        <Quiz key={day.day} questions={day.quiz} />

        {isLast ? (
          <SectionCard id="أتممت الرحلة" title={t.done} icon={PartyPopper} className="bg-leaf/10 ring-leaf/30">
            <p className="leading-relaxed">{t.doneText}</p>
          </SectionCard>
        ) : (
          <button
            type="button"
            onClick={onNext}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-leaf py-3.5 font-bold text-white transition-colors hover:bg-leaf-deep"
          >
            {t.next}
            <ArrowLeft className="size-5 ltr:rotate-180" aria-hidden="true" />
          </button>
        )}
      </div>
    </article>
  );
}
