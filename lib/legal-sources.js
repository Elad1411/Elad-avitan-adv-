// ספריית מקורות משפטיים — חקיקה ופסיקה ישראלית אמיתית בלבד.
// קישורי חקיקה: "ספר החוקים הפתוח" (ויקיטקסט) — נוסח מעודכן של החקיקה הישראלית.
// קישורי פסיקה: מאגר פסקי הדין של בית המשפט העליון (איתור לפי מספר הליך) ונבו.

export const SUPREME_COURT_SEARCH = 'https://supremedecisions.court.gov.il/'
export const NEVO_HOME = 'https://www.nevo.co.il/'

const wiki = (title) => `https://he.wikisource.org/wiki/${title.replace(/ /g, '_')}`

export const LITIGATION_AREAS = [
  { value: 'commercial', label: 'ליטיגציה מסחרית' },
  { value: 'labor', label: 'דיני עבודה' },
  { value: 'family', label: 'דיני משפחה' },
  { value: 'defamation', label: 'לשון הרע' },
  { value: 'traffic', label: 'תעבורה' },
  { value: 'contracts', label: 'חוזים' },
  { value: 'realestate', label: 'מקרקעין' },
  { value: 'administrative', label: 'משפט מינהלי' },
]

// type: statute | regulation | case | rules
// areas: תחומי העיסוק שהמקור רלוונטי אליהם; 'general' — רלוונטי לכל תחום (סדרי דין וכו')
export const LEGAL_SOURCES = [
  // ===== סדרי דין וכללי =====
  {
    id: 'sda-2018', type: 'regulation',
    name: 'תקנות סדר הדין האזרחי, תשע"ט-2018',
    citation: 'ק"ת תשע"ט, 1930',
    link: wiki('תקנות סדר הדין האזרחי'),
    areas: ['general'],
    note: 'המסגרת הדיונית לכל הליך אזרחי: מבנה כתב תביעה וכתב הגנה (תקנות 9–10), בקשות (תקנה 49 ואילך) וסעדים זמניים (פרק ט"ו).',
  },
  {
    id: 'batei-mishpat', type: 'statute',
    name: 'חוק בתי המשפט [נוסח משולב], תשמ"ד-1984',
    citation: 'ס"ח תשמ"ד, 198',
    link: wiki('חוק בתי המשפט'),
    areas: ['general'],
    note: 'סמכות עניינית של בתי משפט השלום והמחוזי (סעיפים 40, 51) — קביעת הערכאה המוסמכת.',
  },
  {
    id: 'hityashnut', type: 'statute',
    name: 'חוק ההתיישנות, תשי"ח-1958',
    citation: 'ס"ח תשי"ח, 112',
    link: wiki('חוק ההתיישנות'),
    areas: ['general'],
    note: 'תקופת התיישנות של 7 שנים בתביעה אזרחית שאינה במקרקעין (סעיף 5) — בדיקת מועדים בפתיחת כל תיק.',
  },
  {
    id: 'hotzaa-lapoal', type: 'statute',
    name: 'חוק ההוצאה לפועל, תשכ"ז-1967',
    citation: 'ס"ח תשכ"ז, 116',
    link: wiki('חוק ההוצאה לפועל'),
    areas: ['general', 'commercial', 'contracts'],
    note: 'אכיפת פסקי דין וגביית חובות — רלוונטי לשלב שלאחר פסק הדין ולמכתבי התרעה.',
  },
  {
    id: 'yesod-kavod', type: 'statute',
    name: 'חוק-יסוד: כבוד האדם וחירותו',
    citation: 'ס"ח התשנ"ב, 150',
    link: wiki('חוק-יסוד: כבוד האדם וחירותו'),
    areas: ['general', 'administrative', 'defamation', 'family'],
    note: 'הגנה חוקתית על כבוד האדם, פרטיות וקניין — בסיס לטיעון חוקתי בהליכים אזרחיים ומינהליים.',
  },
  {
    id: 'nezikin', type: 'statute',
    name: 'פקודת הנזיקין [נוסח חדש]',
    citation: 'נ"ח תשכ"ח, 266',
    link: wiki('פקודת הנזיקין'),
    areas: ['general', 'commercial', 'traffic', 'realestate', 'defamation'],
    note: 'עוולות הרשלנות (סעיפים 35–36), הפרת חובה חקוקה (סעיף 63) ופיצויים — בסיס לעילות נזיקיות.',
  },

  // ===== חוזים ומסחרי =====
  {
    id: 'hozim-klali', type: 'statute',
    name: 'חוק החוזים (חלק כללי), תשל"ג-1973',
    citation: 'ס"ח תשל"ג, 118',
    link: wiki('חוק החוזים (חלק כללי)'),
    areas: ['contracts', 'commercial', 'realestate', 'labor'],
    note: 'כריתת חוזה, פגמים בכריתה (טעות, הטעיה, כפייה, עושק), תום לב במו"מ (סעיף 12) ובקיום (סעיף 39).',
  },
  {
    id: 'hozim-trufot', type: 'statute',
    name: 'חוק החוזים (תרופות בשל הפרת חוזה), תשל"א-1970',
    citation: 'ס"ח תשל"א, 16',
    link: wiki('חוק החוזים (תרופות בשל הפרת חוזה)'),
    areas: ['contracts', 'commercial', 'realestate'],
    note: 'אכיפה, ביטול ופיצויים בשל הפרת חוזה — סעיפים 2, 10 (פיצויי קיום) ו-15 (פיצויים מוסכמים).',
  },
  {
    id: 'mecher', type: 'statute',
    name: 'חוק המכר, תשכ"ח-1968',
    citation: 'ס"ח תשכ"ח, 98',
    link: wiki('חוק המכר'),
    areas: ['contracts', 'commercial'],
    note: 'חיובי מוכר וקונה, אי-התאמה (סעיף 11) והודעה על אי-התאמה — עסקאות מכר טובין.',
  },
  {
    id: 'ashiyat-osher', type: 'statute',
    name: 'חוק עשיית עושר ולא במשפט, תשל"ט-1979',
    citation: 'ס"ח תשל"ט, 42',
    link: wiki('חוק עשיית עושר ולא במשפט'),
    areas: ['contracts', 'commercial', 'realestate'],
    note: 'השבת זכייה שלא כדין (סעיף 1) — עילה משלימה או חלופית לעילה החוזית.',
  },
  {
    id: 'hevrot', type: 'statute',
    name: 'חוק החברות, תשנ"ט-1999',
    citation: 'ס"ח תשנ"ט, 189',
    link: wiki('חוק החברות'),
    areas: ['commercial'],
    note: 'הרמת מסך (סעיף 6), חובות נושאי משרה (סעיפים 252–254), קיפוח המיעוט (סעיף 191) ותביעה נגזרת.',
  },
  {
    id: 'avlot-mishariyot', type: 'statute',
    name: 'חוק עוולות מסחריות, תשנ"ט-1999',
    citation: 'ס"ח תשנ"ט, 146',
    link: wiki('חוק עוולות מסחריות'),
    areas: ['commercial'],
    note: 'גניבת עין, גזל סוד מסחרי ותיאור כוזב — עוולות בתחרות העסקית, כולל פיצוי ללא הוכחת נזק.',
  },
  {
    id: 'apropim', type: 'case',
    name: 'ע"א 4628/93 מדינת ישראל נ\' אפרופים שיכון ויזום (1991) בע"מ',
    citation: 'פ"ד מט(2) 265 (1995)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: ע"א 4628/93',
    areas: ['contracts', 'commercial', 'realestate'],
    note: 'הלכת הפרשנות התכליתית של חוזים — התחקות אחר אומד דעת הצדדים מלשון החוזה ומהנסיבות כאחד.',
  },
  {
    id: 'migdalei-yerakot', type: 'case',
    name: 'דנ"א 2045/05 ארגון מגדלי ירקות — אגודה חקלאית שיתופית בע"מ נ\' מדינת ישראל',
    citation: 'פ"ד סא(2) 1 (2006)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: דנ"א 2045/05',
    areas: ['contracts', 'commercial'],
    note: 'דיון נוסף שאישר את הלכת אפרופים: מקום שלשון החוזה ברורה — לה משקל מכריע בפרשנות.',
  },
  {
    id: 'leibovitz', type: 'case',
    name: 'רע"א 371/89 ליבוביץ נ\' א. את י. אליהו בע"מ',
    citation: 'פ"ד מד(2) 309 (1990)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: רע"א 371/89',
    areas: ['commercial'],
    note: 'גבולות עילת עשיית עושר בתחרות מסחרית ודרישת "היסוד הנוסף" של התנהגות פסולה.',
  },
  {
    id: 'buchbinder', type: 'case',
    name: 'ע"א 610/94 בוכבינדר נ\' כונס הנכסים הרשמי בתפקידו כמפרק בנק צפון אמריקה',
    citation: 'פ"ד נז(4) 289 (2003)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: ע"א 610/94',
    areas: ['commercial'],
    note: 'חובת הזהירות וחובת האמונים של דירקטורים — אמת מידה לאחריות נושאי משרה.',
  },
  {
    id: 'vaaknin', type: 'case',
    name: 'ע"א 145/80 ועקנין נ\' המועצה המקומית בית שמש',
    citation: 'פ"ד לז(1) 113 (1982)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: ע"א 145/80',
    areas: ['commercial', 'traffic', 'realestate', 'general'],
    note: 'המסגרת הקלאסית לעוולת הרשלנות: חובת זהירות מושגית וקונקרטית, התרשלות וקשר סיבתי.',
  },

  // ===== דיני עבודה =====
  {
    id: 'beit-din-avoda', type: 'statute',
    name: 'חוק בית הדין לעבודה, תשכ"ט-1969',
    citation: 'ס"ח תשכ"ט, 70',
    link: wiki('חוק בית הדין לעבודה'),
    areas: ['labor'],
    note: 'סמכותו הייחודית של בית הדין לעבודה בסכסוכי עבודה (סעיף 24) — קביעת הערכאה המוסמכת.',
  },
  {
    id: 'pitzuyei-piturim', type: 'statute',
    name: 'חוק פיצויי פיטורים, תשכ"ג-1963',
    citation: 'ס"ח תשכ"ג, 136',
    link: wiki('חוק פיצויי פיטורים'),
    areas: ['labor'],
    note: 'הזכות לפיצויי פיטורים, חישובם (סעיף 12) והתפטרות בדין מפוטר (סעיף 11).',
  },
  {
    id: 'hagant-hasachar', type: 'statute',
    name: 'חוק הגנת השכר, תשי"ח-1958',
    citation: 'ס"ח תשי"ח, 86',
    link: wiki('חוק הגנת השכר'),
    areas: ['labor'],
    note: 'מועדי תשלום שכר, הלנת שכר ופיצויי הלנה (סעיפים 17, 20) — בסיס לתביעות שכר.',
  },
  {
    id: 'shaot-avoda', type: 'statute',
    name: 'חוק שעות עבודה ומנוחה, תשי"א-1951',
    citation: 'ס"ח תשי"א, 204',
    link: wiki('חוק שעות עבודה ומנוחה'),
    areas: ['labor'],
    note: 'תשלום גמול שעות נוספות (סעיף 16) ומנוחה שבועית — תביעות בגין עבודה בשעות נוספות.',
  },
  {
    id: 'schar-minimum', type: 'statute',
    name: 'חוק שכר מינימום, תשמ"ז-1987',
    citation: 'ס"ח תשמ"ז, 68',
    link: wiki('חוק שכר מינימום'),
    areas: ['labor'],
    note: 'הזכות הקוגנטית לשכר מינימום ופיצוי בגין הפרתה.',
  },
  {
    id: 'hodaa-mukdemet', type: 'statute',
    name: 'חוק הודעה מוקדמת לפיטורים ולהתפטרות, תשס"א-2001',
    citation: 'ס"ח תשס"א, 378',
    link: wiki('חוק הודעה מוקדמת לפיטורים ולהתפטרות'),
    areas: ['labor'],
    note: 'חובת מתן הודעה מוקדמת ותמורת הודעה מוקדמת — רכיב שכיח בתביעות סיום העסקה.',
  },
  {
    id: 'mor', type: 'case',
    name: 'בג"ץ 5168/93 מור נ\' בית הדין הארצי לעבודה',
    citation: 'פ"ד נ(4) 628 (1996)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: בג"ץ 5168/93',
    areas: ['labor'],
    note: 'מעמד "עובד" כמושג מהותי הנקבע לפי מבחן ההשתלבות ולא לפי כינוי ההתקשרות.',
  },
  {
    id: 'sarusi', type: 'case',
    name: 'דנג"ץ 4601/95 סרוסי נ\' בית הדין הארצי לעבודה',
    citation: 'פ"ד נב(4) 817 (1998)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: דנג"ץ 4601/95',
    areas: ['labor'],
    note: 'פרשנות תכליתית של מעמד העובד לצורך חוקי המגן — הרחבת ההגנה הסוציאלית.',
  },

  // ===== דיני משפחה =====
  {
    id: 'beit-mishpaha', type: 'statute',
    name: 'חוק בית המשפט לענייני משפחה, תשנ"ה-1995',
    citation: 'ס"ח תשנ"ה, 393',
    link: wiki('חוק בית המשפט לענייני משפחה'),
    areas: ['family'],
    note: 'סמכות בית המשפט לענייני משפחה ו"ענייני משפחה" כהגדרתם בסעיף 1 — קביעת הערכאה.',
  },
  {
    id: 'yachasei-mamon', type: 'statute',
    name: 'חוק יחסי ממון בין בני זוג, תשל"ג-1973',
    citation: 'ס"ח תשל"ג, 267',
    link: wiki('חוק יחסי ממון בין בני זוג'),
    areas: ['family'],
    note: 'הסדר איזון המשאבים בין בני זוג (סעיפים 5–8) ומועד האיזון — תביעות רכושיות.',
  },
  {
    id: 'kashrut-mishpatit', type: 'statute',
    name: 'חוק הכשרות המשפטית והאפוטרופסות, תשכ"ב-1962',
    citation: 'ס"ח תשכ"ב, 120',
    link: wiki('חוק הכשרות המשפטית והאפוטרופסות'),
    areas: ['family'],
    note: 'אפוטרופסות הורים על קטינים, טובת הקטין (סעיפים 14–25) — משמורת וזמני שהות.',
  },
  {
    id: 'mezonot-law', type: 'statute',
    name: 'חוק לתיקון דיני המשפחה (מזונות), תשי"ט-1959',
    citation: 'ס"ח תשי"ט, 72',
    link: wiki('חוק לתיקון דיני המשפחה (מזונות)'),
    areas: ['family'],
    note: 'חיוב במזונות בני זוג וילדים כשאין דין אישי החל — בסיס נורמטיבי לתביעות מזונות.',
  },
  {
    id: 'yerusha', type: 'statute',
    name: 'חוק הירושה, תשכ"ה-1965',
    citation: 'ס"ח תשכ"ה, 63',
    link: wiki('חוק הירושה'),
    areas: ['family'],
    note: 'ירושה על פי דין ועל פי צוואה, התנגדויות לצוואה (סעיף 25 ואילך) — סכסוכי עיזבון.',
  },
  {
    id: 'bmm-919-15', type: 'case',
    name: 'בע"מ 919/15 פלוני נ\' פלונית',
    citation: 'פסק דין מיום 19.7.2017, פורסם באתר בית המשפט העליון',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: בע"מ 919/15',
    areas: ['family'],
    note: 'הלכת מזונות הילדים בגילאי 15-6 במשמורת משותפת — חלוקת הנטל לפי יכולות כלכליות והסדרי שהות.',
  },
  {
    id: 'bavli', type: 'case',
    name: 'בג"ץ 1000/92 בבלי נ\' בית הדין הרבני הגדול',
    citation: 'פ"ד מח(2) 221 (1994)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: בג"ץ 1000/92',
    areas: ['family'],
    note: 'החלת הלכת השיתוף האזרחית על כלל הערכאות — שוויון רכושי בין בני זוג.',
  },

  // ===== לשון הרע =====
  {
    id: 'lashon-hara', type: 'statute',
    name: 'חוק איסור לשון הרע, תשכ"ה-1965',
    citation: 'ס"ח תשכ"ה, 240',
    link: wiki('חוק איסור לשון הרע'),
    areas: ['defamation'],
    note: 'הגדרת לשון הרע (סעיף 1), דרכי פרסום (סעיף 2), ההגנות (סעיפים 15-13) ופיצוי ללא הוכחת נזק (סעיף 7א).',
  },
  {
    id: 'privacy', type: 'statute',
    name: 'חוק הגנת הפרטיות, תשמ"א-1981',
    citation: 'ס"ח תשמ"א, 128',
    link: wiki('חוק הגנת הפרטיות'),
    areas: ['defamation'],
    note: 'פגיעה בפרטיות כעוולה וכעבירה (סעיפים 1–2) — עילה נלווית שכיחה לתביעות לשון הרע.',
  },
  {
    id: 'shoken', type: 'case',
    name: 'ע"א 4534/02 רשת שוקן בע"מ נ\' הרציקוביץ\'',
    citation: 'פ"ד נח(3) 558 (2004)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: ע"א 4534/02',
    areas: ['defamation'],
    note: 'ארבעת שלבי הניתוח בתביעת לשון הרע ופרשנות הפרסום לפי מבחן האדם הסביר.',
  },
  {
    id: 'avneri', type: 'case',
    name: 'ע"א 214/89 אבנרי נ\' שפירא',
    citation: 'פ"ד מג(3) 840 (1989)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: ע"א 214/89',
    areas: ['defamation'],
    note: 'האיזון בין חופש הביטוי לשם הטוב וריסון סעדי מניעה מוקדמים נגד פרסום.',
  },
  {
    id: 'dayan', type: 'case',
    name: 'דנ"א 2121/12 פלוני נ\' ד"ר אילנה דיין-אורבך',
    citation: 'פ"ד סז(1) 667 (2014)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: דנ"א 2121/12',
    areas: ['defamation'],
    note: 'הגנת "אמת לשעתה" והגנת העיתונאות האחראית במסגרת סעיפים 14–15 לחוק.',
  },
  {
    id: 'nudelman', type: 'case',
    name: 'ע"א 89/04 ד"ר נודלמן נ\' שרנסקי',
    citation: 'פסק דין מיום 4.8.2008, פורסם באתר בית המשפט העליון',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: ע"א 89/04',
    areas: ['defamation'],
    note: 'אמות המידה לפסיקת פיצויים בלשון הרע: חומרת הפגיעה, היקף התפוצה והתנהלות המפרסם.',
  },

  // ===== תעבורה =====
  {
    id: 'pkudat-taavura', type: 'statute',
    name: 'פקודת התעבורה [נוסח חדש]',
    citation: 'נ"ח תשכ"א, 173',
    link: wiki('פקודת התעבורה'),
    areas: ['traffic'],
    note: 'עבירות תעבורה, פסילת רישיון (סעיפים 35 ואילך), נקודות ואמצעי אכיפה.',
  },
  {
    id: 'takanot-taavura', type: 'regulation',
    name: 'תקנות התעבורה, תשכ"א-1961',
    citation: 'ק"ת תשכ"א, 1425',
    link: wiki('תקנות התעבורה'),
    areas: ['traffic'],
    note: 'כללי הנהיגה וחובות הנוהג ברכב — הבסיס לרוב כתבי האישום בתעבורה.',
  },
  {
    id: 'pltd', type: 'statute',
    name: 'חוק פיצויים לנפגעי תאונות דרכים, תשל"ה-1975',
    citation: 'ס"ח תשל"ה, 234',
    link: wiki('חוק פיצויים לנפגעי תאונות דרכים'),
    areas: ['traffic'],
    note: 'אחריות מוחלטת ופיצוי נפגעי תאונות דרכים — הגדרת "תאונת דרכים" וייחוד העילה (סעיף 8).',
  },
  {
    id: 'ozer', type: 'case',
    name: 'רע"א 8061/95 עוזר נ\' אררט חברה לביטוח בע"מ',
    citation: 'פ"ד נ(3) 532 (1996)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: רע"א 8061/95',
    areas: ['traffic'],
    note: 'פרשנות ההגדרה של "תאונת דרכים" והמבחן התחבורתי לאחר תיקון מס\' 8 לחוק הפלת"ד.',
  },

  // ===== מקרקעין =====
  {
    id: 'mekarkein', type: 'statute',
    name: 'חוק המקרקעין, תשכ"ט-1969',
    citation: 'ס"ח תשכ"ט, 259',
    link: wiki('חוק המקרקעין'),
    areas: ['realestate'],
    note: 'עסקאות במקרקעין ודרישת הכתב (סעיף 8), עסקאות נוגדות (סעיף 9), רישום ובתים משותפים.',
  },
  {
    id: 'mecher-dirot', type: 'statute',
    name: 'חוק המכר (דירות), תשל"ג-1973',
    citation: 'ס"ח תשל"ג, 196',
    link: wiki('חוק המכר (דירות)'),
    areas: ['realestate'],
    note: 'אחריות מוכר דירה לאי-התאמה וליקויי בנייה, תקופות בדק ואחריות — תביעות רוכשי דירות.',
  },
  {
    id: 'tichnun-bniya', type: 'statute',
    name: 'חוק התכנון והבנייה, תשכ"ה-1965',
    citation: 'ס"ח תשכ"ה, 307',
    link: wiki('חוק התכנון והבנייה'),
    areas: ['realestate', 'administrative'],
    note: 'היתרי בנייה, שימושים חורגים, היטל השבחה ותביעות לפי סעיף 197.',
  },
  {
    id: 'aharonov', type: 'case',
    name: 'ע"א 189/95 בנק אוצר החייל בע"מ נ\' אהרונוב',
    citation: 'פ"ד נג(4) 199 (1999)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: ע"א 189/95',
    areas: ['realestate', 'commercial'],
    note: 'עדיפות זכותו שביושר של רוכש מקרקעין על פני נושה מעקל של המוכר.',
  },
  {
    id: 'ganz', type: 'case',
    name: 'ע"א 2643/97 גנז נ\' בריטיש וקולוניאל חברה בע"מ',
    citation: 'פ"ד נז(2) 385 (2003)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: ע"א 2643/97',
    areas: ['realestate'],
    note: 'תחרות עסקאות נוגדות לפי סעיף 9 לחוק המקרקעין וחובת תום הלב של הקונה הראשון (אי-רישום הערת אזהרה).',
  },

  // ===== משפט מינהלי =====
  {
    id: 'batei-minhali', type: 'statute',
    name: 'חוק בתי משפט לענינים מינהליים, תש"ס-2000',
    citation: 'ס"ח תש"ס, 190',
    link: wiki('חוק בתי משפט לענינים מינהליים'),
    areas: ['administrative'],
    note: 'סמכות בית המשפט לעניינים מינהליים, עתירות מינהליות והתוספת הראשונה לחוק.',
  },
  {
    id: 'sdarei-minhal', type: 'statute',
    name: 'חוק לתיקון סדרי המינהל (החלטות והנמקות), תשי"ט-1958',
    citation: 'ס"ח תשי"ט, 7',
    link: wiki('חוק לתיקון סדרי המינהל (החלטות והנמקות)'),
    areas: ['administrative'],
    note: 'חובת רשות ציבורית להשיב לפניות ולנמק החלטות בתוך המועדים הקבועים בחוק.',
  },
  {
    id: 'chofesh-meida', type: 'statute',
    name: 'חוק חופש המידע, תשנ"ח-1998',
    citation: 'ס"ח תשנ"ח, 226',
    link: wiki('חוק חופש המידע'),
    areas: ['administrative'],
    note: 'זכות העיון במידע ציבורי ועתירות חופש מידע — כלי מקדים לאיסוף ראיות מול רשויות.',
  },
  {
    id: 'dapei-zahav', type: 'case',
    name: 'בג"ץ 389/80 דפי זהב בע"מ נ\' רשות השידור',
    citation: 'פ"ד לה(1) 421 (1980)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: בג"ץ 389/80',
    areas: ['administrative'],
    note: 'עילת הסבירות במשפט המינהלי — ביקורת שיפוטית על שיקול דעת הרשות.',
  },
  {
    id: 'berger', type: 'case',
    name: 'בג"ץ 297/82 ברגר נ\' שר הפנים',
    citation: 'פ"ד לז(3) 29 (1983)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: בג"ץ 297/82',
    areas: ['administrative'],
    note: 'חובת הרשות להפעיל שיקול דעת ענייני ובמהירות הראויה; ביטול החלטה בשל שיקולים זרים.',
  },
  {
    id: 'schnitzer', type: 'case',
    name: 'בג"ץ 680/88 שניצר נ\' הצנזור הצבאי הראשי',
    citation: 'פ"ד מב(4) 617 (1989)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: בג"ץ 680/88',
    areas: ['administrative'],
    note: 'אמת המידה של "ודאות קרובה" לפגיעה ממשית כתנאי להגבלת זכויות על ידי רשות.',
  },

  // ===== שכר טרחה ואתיקה =====
  {
    id: 'lishka-law', type: 'statute',
    name: 'חוק לשכת עורכי הדין, תשכ"א-1961',
    citation: 'ס"ח תשכ"א, 178',
    link: wiki('חוק לשכת עורכי הדין'),
    areas: ['fees', 'general'],
    note: 'הסדרת מקצוע עריכת הדין, שכר טרחה (סעיפים 81 ואילך) וכללי האתיקה מכוחו.',
  },
  {
    id: 'klalei-etika', type: 'rules',
    name: 'כללי לשכת עורכי הדין (אתיקה מקצועית), תשמ"ו-1986',
    citation: 'ק"ת תשמ"ו, 1373',
    link: wiki('כללי לשכת עורכי הדין (אתיקה מקצועית)'),
    areas: ['fees', 'general'],
    note: 'חובות עורך הדין כלפי לקוחו: נאמנות ומסירות (כלל 2), ניגוד עניינים (כללים 14–16) ושכר טרחה.',
  },
  {
    id: 'yachin-hakal', type: 'case',
    name: 'ע"א 9282/02 יכין חקל בע"מ נ\' עו"ד יחיאל',
    citation: 'פ"ד נח(5) 20 (2004)',
    link: SUPREME_COURT_SEARCH, searchHint: 'חיפוש במאגר העליון: ע"א 9282/02',
    areas: ['fees'],
    note: 'אמות המידה לקביעת שכר טרחה ראוי בהיעדר הסכם מפורש — חשיבות עריכת הסכם שכ"ט בכתב.',
  },
]

export function getSourceById(id) {
  return LEGAL_SOURCES.find(s => s.id === id) || null
}

export function getSourcesForArea(area) {
  return LEGAL_SOURCES.filter(s => s.areas.includes(area) || s.areas.includes('general'))
}

// ברירת מחדל מומלצת לכל תחום — לפחות 3 מקורות
export function getSuggestedSourceIds(area, docType) {
  if (docType === 'fee_agreement') return ['lishka-law', 'klalei-etika', 'yachin-hakal']
  const byArea = {
    commercial: ['hozim-klali', 'apropim', 'nezikin', 'sda-2018'],
    labor: ['beit-din-avoda', 'pitzuyei-piturim', 'mor', 'hagant-hasachar'],
    family: ['beit-mishpaha', 'yachasei-mamon', 'bmm-919-15'],
    defamation: ['lashon-hara', 'shoken', 'nudelman'],
    traffic: ['pkudat-taavura', 'takanot-taavura', 'pltd', 'ozer'],
    contracts: ['hozim-klali', 'hozim-trufot', 'apropim'],
    realestate: ['mekarkein', 'aharonov', 'ganz', 'sda-2018'],
    administrative: ['batei-minhali', 'dapei-zahav', 'berger'],
  }
  return byArea[area] || ['sda-2018', 'batei-mishpat', 'hityashnut']
}

export const AREA_LABELS = Object.fromEntries(LITIGATION_AREAS.map(a => [a.value, a.label]))

export const SOURCE_TYPE_LABELS = {
  statute: 'חקיקה',
  regulation: 'תקנות',
  rules: 'כללים',
  case: 'פסיקה',
}
