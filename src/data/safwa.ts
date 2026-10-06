import data from "./safwa.generated.json";

/** One heading of «صفة الصفوة», its text kept verbatim (a tab inside a paragraph separates the two halves of a verse). */
export interface Leaf {
  id: string;
  line: number;
  ar: string;
  en: string;
  bookAr: string;
  paras: string[];
  /** English summary points (not a translation), shown in English mode. */
  summaryEn: string[];
}

export interface Branch {
  id: string;
  ar: string;
  en: string;
  blurbAr: string;
  blurbEn: string;
  leaves: Leaf[];
}

export interface Tree {
  root: { ar: string; en: string; subAr: string; subEn: string };
  branches: Branch[];
}

export type TreeKey = "prophet" | "ten";

export const safwa = data as { source: { ar: string; en: string }; prophet: Tree; ten: Tree };
