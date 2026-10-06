// Typed loader for the build-time generated content. Contains no literal content.
import raw from "./journey.generated.json";
import type { Lang } from "../lib/i18n";

export interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string | null;
}

export interface Misconception {
  peopleSay: string | null;
  correct: string;
}

export interface Day {
  day: number;
  unitNumber: number;
  unitTitle: string;
  title: string;
  question: string;
  principle: string;
  quran: string | null;
  sunnah: string | null;
  /** English meaning of the Quran/Sunnah text, only when taken from an approved source. */
  quranEn?: string | null;
  quranPartial?: boolean;
  quranSource?: string | null;
  sunnahEn?: string | null;
  sunnahSource?: string | null;
  misconception: Misconception | null;
  action: string;
  lesson: string[];
  quote: string | null;
  quiz: QuizQuestion[];
  askTheBook: string[];
}

export interface Unit {
  number: number;
  title: string;
  startDay: number;
  endDay: number;
  dayCount: number;
}

type EnDay = Partial<Omit<Day, "quiz">> & { day: number; quiz?: { question: string; options: string[]; explanation?: string | null }[] };
const data = raw as unknown as { days: Day[]; units: Unit[]; en: { units: Record<string, string>; days: Record<string, EnDay> } };

const localizeDay = (d: Day): Day => {
  const t = data.en.days[d.day];
  if (!t) return d;
  return {
    ...d,
    unitTitle: data.en.units[d.unitNumber] ?? d.unitTitle,
    title: t.title ?? d.title,
    question: t.question ?? d.question,
    principle: t.principle ?? d.principle,
    misconception: t.misconception ?? d.misconception,
    action: t.action ?? d.action,
    lesson: t.lesson ?? d.lesson,
    quote: t.quote ?? d.quote,
    askTheBook: t.askTheBook ?? d.askTheBook,
    quranEn: t.quranEn ?? null,
    quranSource: t.quranSource ?? null,
    quranPartial: t.quranPartial ?? false,
    sunnahEn: t.sunnahEn ?? null,
    sunnahSource: t.sunnahSource ?? null,
    quiz: d.quiz.map((q, i) => ({
      ...q,
      question: t.quiz?.[i]?.question ?? q.question,
      options: t.quiz?.[i]?.options ?? q.options,
      explanation: t.quiz?.[i]?.explanation ?? q.explanation,
    })),
  };
};

const BY_LANG: Record<Lang, { days: Day[]; units: Unit[] }> = {
  ar: { days: data.days, units: data.units },
  en: {
    days: data.days.map(localizeDay),
    units: data.units.map((u) => ({ ...u, title: data.en.units[u.number] ?? u.title })),
  },
};

export const journeyFor = (lang: Lang) => BY_LANG[lang];
export const totalDays = data.days.length;
