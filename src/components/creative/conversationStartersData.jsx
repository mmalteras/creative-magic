import { Hammer, Gift, Target, Scale, Award, AlertCircle, Clock, Flame, Radio, Mountain, HeartHandshake, PiggyBank, Wind, Star, CheckCircle, CalendarOff, Puzzle, Sparkles, GraduationCap, Users, Eye, Zap, BookOpen, RotateCcw, TrendingUp, Timer, Lightbulb, Heart } from 'lucide-react';

export const conversationStarters = [
  {
    title: "סיפור השינוי שלי",
    description: "בוא ניצור מודעה עוצמתית שמספרת את הדרך שעברת מנקודת מוצא קשה להצלחה מרשימה - הסיפור האמיתי שמניע אנשים",
    Icon: RotateCcw,
    color: "bg-gradient-to-br from-emerald-400 to-cyan-500 text-white",
    prompt: "תיצור לי מודעה המבוססת על סיפור טרנספורמציה אישית ושינוי מקיף"
  },
  {
    title: "חלום שמתגשם",
    description: "נכתוב מודעה לאנשים שמרגישים תקועים במקום - נראה להם איך הפחדים הופכים להזדמנויות ואיך החלום הופך למציאות",
    Icon: Heart,
    color: "bg-gradient-to-br from-rose-400 to-pink-500 text-white",
    prompt: "תיצור לי מודעה לקהל שחולם על תוצאה אבל מתמודד עם פחדים"
  },
  {
    title: "מה אם אמרתי לך ש...",
    description: "מודעה שפותחת עיניים - נזמין את הקורא לדמיין איך החיים שלו נראים אחרי הפתרון, למרות כל הספקות",
    Icon: Eye,
    color: "bg-gradient-to-br from-purple-400 to-indigo-500 text-white",
    prompt: "תיצור לי מודעה שמזמינה את הקהל לדמיין את המצב הרצוי ומראה שזה אפשרי"
  },
  {
    title: "הכאב הנסתר",
    description: "נגע בנרב הכי רגיש - נכתוב מודעה שמזהה בדיוק את מה שמציק ללקוחות שלך בלילות ומראה שאתה מבין אותם",
    Icon: AlertCircle,
    color: "bg-gradient-to-br from-red-400 to-rose-500 text-white",
    prompt: "אני רוצה ליצור מודעה שמדברת על הכאב של הלקוחות שלי"
  },
  {
    title: "הזמנה יוצאת דופן",
    description: "נעצב מודעה ללייב בלתי נשכח - עם מקומות מוגבלים, ערך עצום ותחושה שזה קורה רק פעם אחת",
    Icon: Radio,
    color: "bg-gradient-to-br from-sky-400 to-blue-500 text-white",
    prompt: "תיצור לי מודעה שמזמינה לשידור חי עם ערך רב ויוצרת דחיפות"
  },
  {
    title: "סוד המומחים",
    description: "נבנה מודעה על בסיס עדויות וממליצים שהם אוטוריטה בתחום - הכוח של הוכחה חברתית מקצועית",
    Icon: Users,
    color: "bg-gradient-to-br from-blue-400 to-indigo-600 text-white",
    prompt: "תיצור לי מודעה המבוססת על המלצות ועדויות מומחים"
  },
  {
    title: "עכשיו או אף פעם",
    description: "נפתח מודעה שיוצרת תחושת דחיפות אמיתית - הזמן הולך ואתה חייב לפעול היום כדי לא לפספס",
    Icon: Timer,
    color: "bg-gradient-to-br from-orange-400 to-red-500 text-white",
    prompt: "תיצור לי מודעה שיוצרת תחושת דחיפות ומעודדת פעולה מיידית"
  },
  {
    title: "בזמן הכי קצר",
    description: "מודעה שמבטיחה תוצאות מהירות ללא עמל מיותר - נראה איך להגיע למטרה בדרך החכמה והיעילה ביותר",
    Icon: Zap,
    color: "bg-gradient-to-br from-yellow-400 to-orange-500 text-white",
    prompt: "תיצור לי מודעה שמבטיחה תוצאות בלי מאמץ קשה ומייגע"
  },
  {
    title: "אירוע בלעדי",
    description: "נכין מודעה למשהו מיוחד שקורה פעם ביובל - אווירה אינטימית, מקומות מוגבלים וערך שלא יחזור",
    Icon: Star,
    color: "bg-gradient-to-br from-amber-400 to-yellow-500 text-white",
    prompt: "תיצור לי מודעה שמציגה אירוע מיוחד עם מקומות מוגבלים וערך רב"
  },
  {
    title: "רגע האמת",
    description: "נשתף איך בדיוק הגעת לתוצאות - מה לא עבד, מה כן עבד, ומה אתה מוכן לחשף רק עכשיו",
    Icon: HeartHandshake,
    color: "bg-gradient-to-br from-pink-400 to-rose-500 text-white",
    prompt: "תיצור לי מודעה שמשתפת בקצרה את הדרך להצלחה ומזמינה לשמוע עוד"
  },
  {
    title: "הזמן האחרון",
    description: "נכריז שהתקופה של הכאב הסתיימה - זה הרגע שבו הכל משתנה ויש דרך חדשה לחיות",
    Icon: CalendarOff,
    color: "bg-gradient-to-br from-red-500 to-pink-600 text-white",
    prompt: "תיצור לי מודעה שמכריזה שנגמרו הימים של כאב מסוים ומציגה פתרון"
  },
  {
    title: "לפני ואחרי מדהים",
    description: "נציג את השינוי הדרמטי שחל אצל הלקוחות שלך - התמונה שמדברת יותר מאלף מילים",
    Icon: TrendingUp,
    color: "bg-gradient-to-br from-green-400 to-emerald-500 text-white",
    prompt: "תיצור לי מודעה שמציגה את השינוי שחל אצל הלקוחות שלי לפני ואחרי"
  },
  {
    title: "חדשות מרעישות",
    description: "מודעה על גילוי או שיטה חדשה שמחליפה דרכים ישנות - מה שכולם עשו עד עכשיו כבר לא רלוונטי",
    Icon: Lightbulb,
    color: "bg-gradient-to-br from-amber-400 to-orange-500 text-white",
    prompt: "תיצור לי מודעה שמציגה דרך חדשה ומשופרת להגיע לתוצאה"
  },
  {
    title: "תלמד מהטעויות שלי",
    description: "נספר סיפור אישי עם דמעות וצחוק - איך נפלת וקמת, והשיעור שכולם חייבים לדעת",
    Icon: BookOpen,
    color: "bg-gradient-to-br from-indigo-400 to-purple-500 text-white",
    prompt: "תיצור לי מודעה המבוססת על סיפור אישי או סיפור לקוח"
  },
  {
    title: "מי נגד מי",
    description: "נערוך השוואה חדה ובלתי פוסקת בין הפתרון שלך לכל מה שקיים בשוק - מה באמת עובד ומה לא",
    Icon: Scale,
    color: "bg-gradient-to-br from-violet-400 to-purple-600 text-white",
    prompt: "תיצור לי מודעה שמשווה את הפתרון שלי עם חלופות אחרות בשוק"
  },
  {
    title: "הזדמנות בלתי חוזרת",
    description: "נציג הצעה מיוחדת שכל כך טובה שקשה להאמין - מחיר מגוחך לזמן קצר עד שתתחרט על זה",
    Icon: Flame,
    color: "bg-gradient-to-br from-orange-500 to-red-600 text-white",
    prompt: "תיצור לי מודעה שמציעה הזדמנות מיוחדת בהשקעה מצחיקה לזמן מוגבל"
  },
  {
    title: "תתחיל לחלום שוב",
    description: "מודעה שמעירה השראה ותקווה - נזכיר לקהל שלך מי הם באמת ומה הם יכולים להשיג",
    Icon: Sparkles,
    color: "bg-gradient-to-br from-purple-400 to-pink-500 text-white",
    prompt: "תיצור לי מודעה מעוררת השראה שתמוטיב את קהל היעד שלי לפעולה"
  },
  {
    title: "אימון חינם עכשיו",
    description: "נציע הדרכה בלעדית לזמן מוגבל - ערך אמיתי בחינם עם טיימר שרץ ויוצר לחץ חיובי",
    Icon: GraduationCap,
    color: "bg-gradient-to-br from-blue-400 to-cyan-500 text-white",
    prompt: "תיצור לי מודעה שמציעה הדרכה בחינם לזמן מוגבל עם ערך רב"
  },
  {
    title: "מקרה אמיתי מהחיים",
    description: "נספר את הסיפור של לקוח ספציפי - איך הוא הגיע, מה עבר ומה קיבל בסוף, עם מספרים ועובדות",
    Icon: Target,
    color: "bg-gradient-to-br from-green-500 to-emerald-600 text-white",
    prompt: "תיצור לי מודעה המציגה תוצאות ממקרה אמיתי ומוכח"
  },
  {
    title: "החמצת והפעם אל תפספס",
    description: "נכתוב מודעה שמעוררת פחד מהחמצה - מה קרה לאלה שחיכו, ומה יקרה לך אם תחכה שוב",
    Icon: Wind,
    color: "bg-gradient-to-br from-purple-500 to-indigo-600 text-white",
    prompt: "תיצור לי מודעה שמעוררת דחיפות ופחד מהחמצת הזדמנות מיוחדת"
  },
];