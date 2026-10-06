import type { Lang } from "./i18n";

const fmt = new Intl.NumberFormat("ar-EG", { useGrouping: false });

/** Arabic-Indic numerals for UI chrome. Never apply to verbatim book text. */
export const toArabic = (n: number): string => fmt.format(n);

/** Correct grammar for a count of days in either language. */
export const dayCountLabel = (n: number, lang: Lang = "ar"): string => {
  if (lang === "en") return n === 1 ? "1 day" : `${n} days`;
  if (n === 1) return "يوم";
  if (n === 2) return "يومان";
  if (n >= 3 && n <= 10) return `${toArabic(n)} أيام`;
  return `${toArabic(n)} يومًا`;
};
