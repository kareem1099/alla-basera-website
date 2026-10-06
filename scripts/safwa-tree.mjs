/**
 * Shape of the two trees built from «صفة الصفوة». Each leaf is [bookLine, arabicTitle, englishTitle, paraFrom?, paraTo?]
 * where bookLine is the line of the heading in the OpenITI file; its text is pulled verbatim by build-safwa.mjs.
 */
export const RANGE = { from: 275, to: 3502 };

export const PROPHET = {
  root: {
    ar: "مُحَمَّدٌ رَسُولُ اللَّهِ ﷺ",
    en: "Muhammad, the Messenger of Allah ﷺ",
    subAr: "محمد بن عبد الله بن عبد المطلب بن هاشم بن عبد مناف",
    subEn: "Muhammad son of Abdullah son of Abd al-Muttalib son of Hashim son of Abd Manaf",
  },
  branches: [
    { ar: "نسبه ومولده", en: "Lineage and birth", blurbAr: "من أي بيت جاء، وكيف وُلد، وما أسماؤه", blurbEn: "His family, his birth and his names",
      leaves: [[275, "نسبه الشريف", "His noble lineage"], [283, "طهارة آبائه وشرفهم", "The purity and honour of his forefathers"], [287, "زواج عبد الله بآمنة", "Abdullah marries Aminah"], [325, "حمل آمنة به", "Aminah's pregnancy"], [333, "وفاة أبيه عبد الله", "The death of his father"], [346, "مولده ﷺ", "His birth ﷺ"], [376, "أسماؤه ﷺ", "His names ﷺ"]] },
    { ar: "طفولته وشبابه", en: "Childhood and youth", blurbAr: "الرضاع واليُتم والكفالة، حتى زواجه من خديجة", blurbEn: "Nursing, orphanhood and guardianship, up to his marriage to Khadijah",
      leaves: [[396, "من أرضعه", "Those who nursed him"], [480, "وفاة أمه آمنة", "The death of his mother"], [489, "بعد وفاة أمه", "After his mother's death"], [502, "كفالة أبي طالب", "In Abu Talib's care"], [509, "حديث بحيرا الراهب", "The monk Bahira"], [558, "رعيه الغنم", "Shepherding"], [565, "خروجه إلى الشام", "His journey to Syria"], [587, "زواجه من خديجة", "His marriage to Khadijah"], [605, "علامات النبوة قبل الوحي", "Signs of prophethood before revelation"], [624, "بناء الكعبة ووضع الحجر", "Rebuilding the Ka'bah and the Black Stone"]] },
    { ar: "البعثة والوحي", en: "The mission and revelation", blurbAr: "كيف بدأ الوحي، وكيف كان يأتيه", blurbEn: "How revelation began and how it came to him",
      leaves: [[631, "بدء الوحي", "The beginning of revelation"], [669, "كيف كان يأتيه الوحي", "How revelation came to him"], [696, "رمي الشياطين بالشهب", "Devils pelted with meteors"], [719, "اعتراف أهل الكتاب بنبوته", "People of the Book affirm his prophethood"], [754, "بدء الدعوة إلى الإسلام", "The first call to Islam"]] },
    { ar: "معجزاته", en: "His miracles", blurbAr: "طرف من معجزاته وإخباره بالغيب", blurbEn: "Some of his miracles and his foretelling of the unseen",
      leaves: [[760, "طرف من معجزاته", "Some of his miracles"], [850, "إخباره بالغائبات", "Foretelling the unseen"]] },
    { ar: "الدعوة في مكة", en: "The call in Makkah", blurbAr: "الأذى والصبر، والإسراء، والحبشة، وبيعة العقبة", blurbEn: "Persecution and patience, the Night Journey, Abyssinia and Aqabah",
      leaves: [[889, "ما لاقى من أذى المشركين وهو صابر", "Persecution he bore with patience"], [927, "وفد جن نصيبين والإسراء", "The jinn of Nasibin and the Night Journey"], [930, "الإسراء والمعراج", "The Ascension"], [1010, "الهجرة إلى الحبشة", "Emigration to Abyssinia"], [1023, "مدة إقامته بمكة بعد النبوة", "How long he stayed in Makkah"], [1034, "عرضه نفسه على القبائل", "Presenting himself to the tribes"], [1058, "بيعة العقبة", "The pledge of Aqabah"]] },
    { ar: "الهجرة والمدينة", en: "Hijrah and Madinah", blurbAr: "الهجرة، وخيمة أم معبد، والقدوم إلى المدينة، والغزوات", blurbEn: "The emigration, Umm Ma'bad, arriving in Madinah, and the expeditions",
      leaves: [[1124, "هجرته إلى المدينة", "His emigration to Madinah"], [1276, "حديث أم معبد", "The account of Umm Ma'bad"], [1326, "شرح غريب حديث أم معبد", "Rare words in Umm Ma'bad's account"], [1342, "قدومه المدينة", "His arrival in Madinah"], [1870, "عدد غزواته وسراياه", "His expeditions"]] },
    { ar: "أهل بيته", en: "His household", blurbAr: "أعمامه وعماته، وأزواجه وأولاده، ومواليه ومراكبه", blurbEn: "Uncles and aunts, wives and children, freed servants and mounts",
      leaves: [[1360, "أعمامه", "His uncles"], [1364, "عماته", "His aunts"], [1368, "أزواجه أمهات المؤمنين", "His wives, Mothers of the Believers"], [1377, "سراريه", "His concubines"], [1382, "أولاده", "His children"], [1393, "بناته", "His daughters"], [1398, "مواليه", "His freedmen"], [1416, "مولياته", "His freedwomen"], [1419, "مراكبه", "His mounts"]] },
    { ar: "صفته الخَلْقية", en: "His appearance", blurbAr: "كيف كان شكله ﷺ كما وصفه من رآه", blurbEn: "How he looked ﷺ, as described by those who saw him",
      leaves: [[1426, "صفة رسول الله ﷺ", "Description of the Messenger ﷺ"], [1531, "شرح غريب الصفة", "Rare words in the description"]] },
    { ar: "أخلاقه وشمائله", en: "His character", blurbAr: "خلقه وتواضعه وحياؤه ورحمته وكرمه وشجاعته وبيانه", blurbEn: "Manners, humility, modesty, mercy, generosity, courage and eloquence",
      leaves: [[1565, "حسن خلقه", "His excellent manners"], [1575, "تواضعه", "His humility"], [1602, "حياؤه", "His modesty"], [1608, "شفقته ومداراته", "His compassion and gentleness"], [1637, "مزاحه ومداعبته", "His good humour"], [1659, "كرمه وجوده", "His generosity"], [1669, "شجاعته", "His courage"], [1875, "فصاحته", "His eloquence"], [1885, "من جوامع كلمه وأمثاله", "His concise sayings and parables"]] },
    { ar: "عبادته وعيشه", en: "Worship and daily life", blurbAr: "اجتهاده في العبادة وزهده في الدنيا", blurbEn: "His devotion in worship and simplicity of living",
      leaves: [[1776, "عبادته واجتهاده", "His worship and devotion"], [1826, "عيشه وفقره", "His simple living"]] },
    { ar: "فضله ومكانته", en: "His rank and virtue", blurbAr: "فضله على الأنبياء، ووجوب محبته، وحب الصحابة له", blurbEn: "His rank among the prophets, the duty to love him, and his Companions' love",
      leaves: [[1682, "فضله على الأنبياء وعلو قدره", "His rank above the prophets"], [1729, "مثله ومثل الأنبياء قبله", "Parable of him and the prophets before him"], [1735, "مثله ومثل ما بعثه الله به", "Parable of what Allah sent him with"], [1742, "مشي الملائكة من ورائه", "Angels walking behind him"], [1745, "وجوب تقديم محبته", "Loving him above all"], [1754, "تعظيم الصحابة له وحبهم إياه", "His Companions' reverence and love"]] },
    { ar: "وفاته ﷺ", en: "His passing ﷺ", blurbAr: "مرضه ووفاته، وغسله وقبره، والصلاة والسلام عليه", blurbEn: "His illness and death, burial, and sending blessings upon him",
      leaves: [[1984, "وفاته ﷺ", "His passing ﷺ"], [2063, "إعلام أبي بكر الناس بموته", "Abu Bakr announces his death"], [2081, "حزن فاطمة عليه", "Fatimah's grief"], [2088, "مبلغ سنه", "His age"], [2097, "غسله", "His washing"], [2118, "موضع قبره", "His grave"], [2122, "الصلاة عليه", "The funeral prayer"], [2131, "بلوغ سلام أمته إليه", "His Ummah's greetings reach him"]] },
  ],
};

const intro = (line) => [line, "نسبه وإسلامه", "Lineage and Islam"];
const T = {
  sifa: ["صفته", "His appearance"],
  awlad: ["أولاده", "His children"],
  manaqib: ["من مناقبه", "His virtues"],
  wafat: ["وفاته", "His death"],
  maqtal: ["مقتله", "His martyrdom"],
};
const L = (line, k) => [line, ...T[k]];

export const TEN = {
  root: {
    ar: "العشرة المبشرون بالجنة",
    en: "The Ten Promised Paradise",
    subAr: "«رسول الله في الجنة، وأبو بكر في الجنة، وعمر في الجنة، وعلي في الجنة، وعثمان في الجنة، وعبد الرحمن في الجنة، وطلحة في الجنة، والزبير في الجنة، وسعد في الجنة» ثم ذكر سعيد بن زيد نفسه العاشر. رواه الإمام أحمد",
    subEn: "Sa'id ibn Zayd reported that the Prophet ﷺ named Abu Bakr, Umar, Ali, Uthman, Abd al-Rahman, Talhah, al-Zubayr and Sa'd as people of Paradise, and Sa'id named himself as the tenth (Ahmad).",
  },
  branches: [
    { id: "abubakr", ar: "أبو بكر الصديق", en: "Abu Bakr al-Siddiq", blurbAr: "أول الخلفاء الراشدين، وصاحب رسول الله ﷺ في الغار", blurbEn: "First of the rightly guided caliphs, the Prophet's companion in the cave",
      leaves: [[2141, "اسمه ونسبه", "Name and lineage"], [2155, "صفته", "His appearance"], [2161, "سبقه إلى الإسلام", "His early Islam"], [2173, "أولاده", "His children"], [2185, "أفعاله الجميلة", "His fine deeds"], [2215, "فضائله ومناقبه", "His virtues"], [2338, "خلافته", "His caliphate"], [2401, "من خطبه ومواعظه", "His sermons and counsel"], [2436, "مرضه ووفاته", "His illness and death"]] },
    { id: "umar", ar: "عمر بن الخطاب", en: "Umar ibn al-Khattab", blurbAr: "الفاروق، ثاني الخلفاء الراشدين", blurbEn: "Al-Faruq, the second rightly guided caliph",
      leaves: [intro(2482), [2486, "سبب إسلامه", "How he embraced Islam"], [2549, "صفته", "His appearance"], [2552, "أولاده", "His children"], [2559, "نزول القرآن بموافقته", "Revelation agreeing with his view"], [2566, "مناقبه وفضائله", "His virtues"], [2590, "خلافته", "His caliphate"], [2596, "اهتمامه برعيته", "His care for his people"], [2631, "زهده", "His austerity"], [2640, "تواضعه", "His humility"], [2648, "خوفه من الله وبكاؤه", "His fear of Allah"], [2655, "تعبده", "His worship"], [2659, "من كلامه ومواعظه", "His words and counsel"], [2671, "وفاته", "His death"]] },
    { id: "uthman", ar: "عثمان بن عفان", en: "Uthman ibn Affan", blurbAr: "ذو النورين، ثالث الخلفاء الراشدين", blurbEn: "Dhu al-Nurayn, the third rightly guided caliph",
      leaves: [intro(2740), L(2752, "sifa"), L(2757, "awlad"), [2763, "فضائله", "His virtues"], [2787, "إخبار النبي ﷺ له بما سيجري عليه", "The Prophet ﷺ foretells his trial"], [2806, "أفعاله الجميلة وطاعاته", "His fine deeds and worship"], [2849, "خلافته", "His caliphate"], L(2853, "maqtal"), [2868, "ثناء الناس عليه", "Praise of him"]] },
    { id: "ali", ar: "علي بن أبي طالب", en: "Ali ibn Abi Talib", blurbAr: "ابن عم رسول الله ﷺ، ورابع الخلفاء الراشدين", blurbEn: "The Prophet's cousin ﷺ and the fourth rightly guided caliph",
      leaves: [intro(2884), L(2890, "sifa"), L(2896, "awlad"), [2909, "ارتقاؤه منكب رسول الله ﷺ", "Climbing on the Prophet's shoulders ﷺ"], [2919, "محبة الله ورسوله له", "Loved by Allah and His Messenger"], [2931, "مؤاخاة النبي ﷺ له", "The Prophet's brotherhood with him ﷺ"], [2936, "من مناقبه", "His virtues"], [2949, "زهده", "His austerity"], [2995, "ورعه", "His scrupulousness"], [3014, "كلمات منتخبة من مواعظه", "Selected sayings"], L(3134, "maqtal")] },
    { id: "talha", ar: "طلحة بن عبيد الله", en: "Talhah ibn Ubaydullah", blurbAr: "من السابقين الأولين، وأحد الستة أهل الشورى", blurbEn: "Among the earliest Muslims and one of the six of the Shura",
      leaves: [intro(3163), L(3176, "sifa"), L(3179, "awlad"), L(3185, "manaqib"), L(3216, "wafat")] },
    { id: "zubair", ar: "الزبير بن العوام", en: "Al-Zubayr ibn al-Awwam", blurbAr: "حواري رسول الله ﷺ", blurbEn: "The disciple of the Messenger ﷺ",
      leaves: [intro(3222), L(3231, "sifa"), L(3234, "awlad"), L(3243, "manaqib"), L(3279, "maqtal")] },
    { id: "abdulrahman", ar: "عبد الرحمن بن عوف", en: "Abd al-Rahman ibn Awf", blurbAr: "التاجر الكريم الذي أنفق ماله في سبيل الله", blurbEn: "The generous merchant who spent his wealth for Allah",
      leaves: [intro(3297), L(3311, "sifa"), [3315, "أولاده", "His children", 0, 2], [3315, "من مناقبه وإنفاقه", "His virtues and charity", 2], L(3365, "wafat")] },
    { id: "saad", ar: "سعد بن أبي وقاص", en: "Sa'd ibn Abi Waqqas", blurbAr: "من السابقين الأولين، وفارس الإسلام", blurbEn: "Among the earliest Muslims, a knight of Islam",
      leaves: [intro(3369), L(3374, "sifa"), L(3376, "awlad"), L(3387, "manaqib"), L(3411, "wafat")] },
    { id: "said", ar: "سعيد بن زيد", en: "Sa'id ibn Zayd", blurbAr: "راوي حديث العشرة، ومن السابقين الأولين", blurbEn: "Narrator of the hadith of the Ten, among the earliest Muslims",
      leaves: [intro(3425), L(3431, "awlad"), L(3438, "manaqib"), L(3453, "wafat")] },
    { id: "abuubaida", ar: "أبو عبيدة بن الجراح", en: "Abu Ubaydah ibn al-Jarrah", blurbAr: "أمين هذه الأمة", blurbEn: "The trustworthy one of this Ummah",
      leaves: [intro(3458), L(3464, "sifa"), L(3467, "manaqib"), L(3497, "wafat")] },
  ],
};

/** Headings intentionally left out (chapter titles with no story of their own). */
export const SKIP = [2138];
