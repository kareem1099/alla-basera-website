import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type Lang = "ar" | "en";

const AR = {
  homeAria: "الرئيسية: على بصيرة",
  siteName: "على بصيرة",
  bookName: "ما لا يسع المسلم جهله",
  journeySubtitle: (n: string) => `رحلة قراءة تفاعلية · ${n} يومًا`,
  day: "اليوم",
  of: "من",
  dayNofM: (n: number, m: number) => `اليوم ${n} من ${m}`,
  currentUnit: "الوحدة الحالية",
  units: "الوحدات",
  unitDays: "أيام الوحدة",
  progress: (p: number) => `التقدم ${p}%`,
  qOfDay: "سؤال النهارده",
  principle: "المبدأ الأساسي",
  quranEvidence: "الدليل من القرآن",
  sunnahEvidence: "الدليل من السنة",
  misconception: "تصحيح مفهوم",
  peopleSay: "الناس بتقول",
  correctIs: "الصح هو",
  lesson: "درس اليوم",
  quote: "اقتباس من الكتاب",
  action: "عمل النهارده",
  done: "أتممت الرحلة",
  doneText: "مبروك! وصلت لآخر يوم في الرحلة. ارجع لأي يوم من قائمة الوحدات وقت ما تحب تراجع.",
  next: "المتابعة إلى اليوم التالي",
  untranslated: "",
  arabicOnly: "",
  quizTest: "اختبر فهمك",
  quizCount: (n: string) => `اختبر فهمك · ${n} أسئلة`,
  quizStart: "ابدأ اختبار اليوم",
  quizTime: "حوالي دقيقتين",
  quizResult: "اختبر فهمك · النتيجة",
  quizQ: (i: string, n: string) => `السؤال ${i} من ${n}`,
  close: "إغلاق",
  score: (s: string, n: string) => `${s} من ${n}`,
  perfect: "ممتاز! فهمت درس اليوم كويس.",
  review: "راجع الدرس وجرب تاني.",
  retry: "إعادة الاختبار",
  options: "الخيارات",
  correctAnswer: "الإجابة الصحيحة",
  evidence: "الدليل:",
  showResult: "عرض النتيجة",
  nextQ: "السؤال التالي",
  letters: ["أ", "ب", "ج", "د"],
  chatName: "رفيق الكتاب",
  chatSub: "اسأل عن درس اليوم من الكتاب",
  connected: "متصل",
  waiting: "بانتظار الربط",
  chatHello: "أهلًا بيك! اسأل أي سؤال عن درس النهارده وهجاوبك من الكتاب.",
  chatSetup: "للتفعيل: ضع رابط نظامك في المتغير VITE_RAG_ENDPOINT داخل ملف ‎.env ثم أعد تشغيل الموقع (التفاصيل في README).",
  fromBook: "من الكتاب",
  external: "خارج المصدر",
  typing: "جاري الكتابة",
  retryChat: "إعادة المحاولة",
  placeholder: "اكتب سؤالك عن درس اليوم…",
  placeholderOff: "يعمل بعد ربط نظامك الذكي…",
  yourQ: "سؤالك",
  send: "إرسال",
  ragError: "تعذّر الوصول إلى رفيق الكتاب الآن. تأكد من الاتصال ثم حاول مرة أخرى.",
  switchTo: "English",
  switchAria: "Switch to English",
  // home
  sections: "أقسام الموقع",
  start: "ابدأ الرحلة",
  soon: "قريبًا",
  f1: (n: string) => `دليل الشاب المسلم في ${n} يومًا`,
  f1b: "كل يوم درس قصير ودليل من القرآن والسنة لتفقيه شبابنا بما لا يمكن جهله.",
  f2: "من هو أشرف الخلق؟",
  f2s: "نبي الله محمد ﷺ",
  f2b: "شجرة من كتاب «صفة الصفوة» لابن الجوزي: نسبه ومولده، وبعثته وهجرته، وصفته وأخلاقه، حتى وفاته ﷺ.",
  f3: "مسلمون حسُن إسلامهم",
  f3s: "العشرة المبشرون بالجنة",
  f3b: "عشرة فروع من «صفة الصفوة»: نسب كل واحد منهم وإسلامه ومناقبه وكلامه ووفاته.",
  explore: "افتح الشجرة",
  treeHint: "كل فرع من الشجرة باب من أبواب الكتاب، وكل كلمة فيه موضوع. اضغط على أي موضوع لتقرأ ما ذكره ابن الجوزي عنه بنصه.",
  fromSafwa: "من صفة الصفوة",
  prevTopic: "السابق",
  fromBook2: "من كتاب «صفة الصفوة» للإمام ابن الجوزي",
  branchesLabel: "فرعًا",
  topicsLabel: "موضوعًا",
  readLabel: "قرأت",
  indexLabel: "فهرس الفروع",
  topicsCount: (n: string) => `${n} موضوعات`,
  treeEnd: "هنا تنتهي الشجرة",
  treeDone: "أتممت الشجرة كلها، بارك الله فيك",
  readOf: (a: string, b: string) => `قرأت ${a} من ${b} موضوعًا`,
  textSize: "حجم الخط",
  smaller: "تصغير الخط",
  larger: "تكبير الخط",
  alsoRead: "اقرأ أيضًا",
  summaryLabel: "",
  summaryNote: "",
  originalText: "",
  nextTopic: "الموضوع التالي",
  verseRef: "[يوسف: ١٠٨]",
  verseTr: "",
  verseTrLabel: "",
  journeyTitle: "دليل الشاب المسلم في ٩٠ يومًا · على بصيرة",
};

type Dict = typeof AR;

const EN: Dict = {
  homeAria: "Home: Ala Baseerah",
  siteName: "Ala Baseerah",
  bookName: "What Every Muslim Must Know",
  journeySubtitle: (n) => `An interactive reading journey · ${n} days`,
  day: "Day",
  of: "of",
  dayNofM: (n, m) => `Day ${n} of ${m}`,
  currentUnit: "Current unit",
  units: "Units",
  unitDays: "Days in this unit",
  progress: (p) => `Progress ${p}%`,
  qOfDay: "Today's question",
  principle: "Core principle",
  quranEvidence: "Evidence from the Quran",
  sunnahEvidence: "Evidence from the Sunnah",
  misconception: "Correcting a misconception",
  peopleSay: "People say",
  correctIs: "What is correct",
  lesson: "Today's lesson",
  quote: "Quote from the book",
  action: "Today's action",
  done: "Journey complete",
  doneText: "Congratulations! You have reached the last day of the journey. Return to any day from the units menu whenever you want to review.",
  next: "Continue to the next day",
  untranslated:
    "The English translation of this text has not been added yet from an approved source, so it is shown in Arabic only.",
  arabicOnly: "Hadith or Quran text, shown in Arabic: no translation from an approved source has been added yet.",
  quizTest: "Check your understanding",
  quizCount: (n) => `Check your understanding · ${n} questions`,
  quizStart: "Start today's quiz",
  quizTime: "About two minutes",
  quizResult: "Check your understanding · Result",
  quizQ: (i, n) => `Question ${i} of ${n}`,
  close: "Close",
  score: (s, n) => `${s} of ${n}`,
  perfect: "Excellent! You understood today's lesson well.",
  review: "Review the lesson and try again.",
  retry: "Retake the quiz",
  options: "Options",
  correctAnswer: "Correct answer",
  evidence: "Evidence:",
  showResult: "Show result",
  nextQ: "Next question",
  letters: ["A", "B", "C", "D"],
  chatName: "Book Companion",
  chatSub: "Ask about today's lesson from the book",
  connected: "Connected",
  waiting: "Not connected yet",
  chatHello: "Welcome! Ask any question about today's lesson and I will answer from the book.",
  chatSetup: "To enable: put your system's URL in the VITE_RAG_ENDPOINT variable in the .env file, then restart the site (details in the README).",
  fromBook: "From the book",
  external: "Outside the source",
  typing: "Typing",
  retryChat: "Try again",
  placeholder: "Type your question about today's lesson…",
  placeholderOff: "Works once your AI system is connected…",
  yourQ: "Your question",
  send: "Send",
  ragError: "The Book Companion cannot be reached right now. Check your connection and try again.",
  switchTo: "العربية",
  switchAria: "التبديل إلى العربية",
  sections: "Site sections",
  start: "Start the journey",
  soon: "Coming soon",
  f1: (n) => `The Young Muslim's Guide in ${n} Days`,
  f1b: "Each day, a short lesson with evidence from the Quran and Sunnah, to teach our young people what no Muslim can afford not to know.",
  f2: "Who is the noblest of creation?",
  f2s: "The Prophet of Allah, Muhammad ﷺ",
  f2b: "A tree drawn from Ibn al-Jawzi's Sifat al-Safwa: his lineage and birth, mission and hijrah, appearance and character, up to his passing ﷺ.",
  f3: "Muslims whose Islam was excellent",
  f3s: "The ten promised Paradise",
  f3b: "Ten branches from Sifat al-Safwa: each one's lineage, Islam, virtues, words and death.",
  explore: "Open the tree",
  treeHint: "Each branch is a chapter of the book and each word on it is a topic. Tap any topic to read what Ibn al-Jawzi wrote about it.",
  fromSafwa: "From Sifat al-Safwa",
  prevTopic: "Previous",
  fromBook2: "From Sifat al-Safwa by Imam Ibn al-Jawzi",
  branchesLabel: "branches",
  topicsLabel: "topics",
  readLabel: "read",
  indexLabel: "Branch index",
  topicsCount: (n) => `${n} topics`,
  treeEnd: "The end of the tree",
  treeDone: "You have read the whole tree. May Allah bless you",
  readOf: (a, b) => `${a} of ${b} topics read`,
  textSize: "Text size",
  smaller: "Smaller text",
  larger: "Larger text",
  alsoRead: "Read next",
  summaryLabel: "Summary",
  summaryNote: "A summary of what Ibn al-Jawzi reports in this section, written for this site — not a translation. The original Arabic text follows below.",
  originalText: "The original Arabic text",
  nextTopic: "Next topic",
  verseRef: "[Yusuf: 108]",
  verseTrLabel: "Translation of the meaning",
  verseTr: "108. Say (O Muhammad SAW): \"This is my way; I invite unto Allah (i.e. to the Oneness of Allah - Islamic Monotheism) with sure knowledge, I and whosoever follows me (also must invite others to Allah i.e. to the Oneness of Allah - Islamic Monotheism) with sure knowledge. And Glorified and Exalted be Allah (above all that they associate as partners with Him). And I am not of the Mushrikun (polytheists, pagans, idolaters and disbelievers in the Oneness of Allah; those who worship others along with Allah or set up rivals or partners to Allah).\" — The Noble Qur'an, Hilali & Khan (King Fahd Complex), via Quranpedia.net",
  journeyTitle: "The Young Muslim's Guide in 90 Days · Ala Baseerah",
};

const DICTS: Record<Lang, Dict> = { ar: AR, en: EN };
const KEY = "ala-baseerah-lang";

const readLang = (): Lang => {
  try {
    const v = localStorage.getItem(KEY);
    if (v === "ar" || v === "en") return v;
  } catch {
    /* storage unavailable */
  }
  return "ar";
};

interface Ctx {
  lang: Lang;
  t: Dict;
  num: (n: number) => string;
  setLang: (l: Lang) => void;
  toggle: () => void;
}

const LangContext = createContext<Ctx | null>(null);
const arFmt = new Intl.NumberFormat("ar-EG", { useGrouping: false });

/** True when a string is Arabic text (used to keep untranslated hadith/Quran right-to-left in English mode). */
export const isArabicText = (s: string | null | undefined): boolean => !!s && /[\u0600-\u06FF]/.test(s.replace(/ﷺ/g, "")) && !/[A-Za-z]/.test(s);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readLang);
  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
    try {
      localStorage.setItem(KEY, lang);
    } catch {
      /* ignore */
    }
  }, [lang]);
  const value: Ctx = {
    lang,
    t: DICTS[lang],
    num: (n) => (lang === "ar" ? arFmt.format(n) : String(n)),
    setLang: setLangState,
    toggle: () => setLangState((l) => (l === "ar" ? "en" : "ar")),
  };
  return <LangContext.Provider value={value}>{children}</LangContext.Provider>;
}

export const useLang = (): Ctx => {
  const c = useContext(LangContext);
  if (!c) throw new Error("useLang outside LangProvider");
  return c;
};

export function LangToggle({ className = "" }: { className?: string }) {
  const { t, toggle, lang } = useLang();
  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={t.switchAria}
      lang={lang === "ar" ? "en" : "ar"}
      data-lang-toggle
      className={`shrink-0 rounded-full bg-paper px-3 py-1.5 text-sm font-bold ring-1 ring-ink/15 hover:ring-leaf/50 ${className}`}
    >
      {t.switchTo}
    </button>
  );
}
