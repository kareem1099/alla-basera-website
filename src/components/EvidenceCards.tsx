import { CircleAlert } from "lucide-react";
import type { Day } from "../data/journey";
import { useLang } from "../lib/i18n";
import SectionCard from "./SectionCard";

interface Props {
  day: Day;
}

/** Quran/Sunnah text always stays in Arabic; in English an approved translation of the meaning is shown under it, or a note when none exists. */
export default function EvidenceCards({ day }: Props) {
  const { lang, t } = useLang();
  const { quran, sunnah } = day;
  if (!quran && !sunnah) return null;
  const both = !!quran && !!sunnah;
  const en = lang === "en";
  const note = <p className="mt-3 border-t border-ink/10 pt-3 text-sm text-ink/60">{t.untranslated}</p>;
  return (
    <div className={both ? "grid gap-4 lg:grid-cols-2" : "grid gap-4"}>
      {quran && (
        <SectionCard id="الدليل من القرآن" title={t.quranEvidence} icon={CircleAlert} className="bg-leaf/10 ring-leaf/20" iconClassName="text-leaf">
          <p lang="ar" dir="rtl" className="font-display text-xl leading-loose whitespace-pre-line">{quran}</p>
          {en &&
            (day.quranEn ? (
              <div className="mt-3 border-t border-ink/10 pt-3">
                <p className="text-xs font-bold tracking-wide text-leaf-deep uppercase">Translation of the meaning</p>
                <p className="mt-1 leading-relaxed whitespace-pre-line">{day.quranEn}</p>
                {day.quranPartial && <p className="mt-2 text-xs text-ink/55">⁽*⁾ The book quotes part of this verse; the translation shown is of the full verse.</p>}
                <p className="mt-2 text-xs text-ink/50">Source: {day.quranSource}</p>
              </div>
            ) : (
              note
            ))}
        </SectionCard>
      )}
      {sunnah && (
        <SectionCard id="الدليل من السنة" title={t.sunnahEvidence} icon={CircleAlert} className="bg-sky/10 ring-sky/25" titleClassName="text-ink" iconClassName="text-sky">
          <p lang="ar" dir="rtl" className="font-display text-xl leading-loose whitespace-pre-line">{sunnah}</p>
          {en &&
            (day.sunnahEn ? (
              <div className="mt-3 border-t border-ink/10 pt-3">
                <p className="leading-relaxed whitespace-pre-line">{day.sunnahEn}</p>
                <p className="mt-2 text-xs text-ink/50">Source: {day.sunnahSource}</p>
              </div>
            ) : (
              note
            ))}
        </SectionCard>
      )}
    </div>
  );
}
