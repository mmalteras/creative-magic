import React from "react";

export default function PrivacyPolicyContent() {
  return (
    <div className="space-y-6 text-gray-700 hebrew-font text-base leading-relaxed">
        <p>
            ב-Creative Magic אנחנו מבינים כמה חשוב לכם הפרטיות שלכם. כשאתם יוצרים איתנו תמונות ממוזערות מדהימות ותוכן ויראלי, אנחנו דואגים לשמור על המידע שלכם במקום הכי בטוח. הנה איך אנחנו עושים את זה:
        </p>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">מה אנחנו אוספים?</h2>
            <p className="mb-2">כדי ליצור עבורכם קאברים מושלמים, אנחנו צריכים:</p>
            <ul className="list-disc pr-5 space-y-1 text-gray-600">
                <li><strong>פרטי החשבון שלכם</strong> - שם ואימייל (דרך Google או הרשמה ישירה)</li>
                <li><strong>התמונות שאתם מעלים</strong> - כדי ליצור עליהן קסם בעזרת הבינה המלאכותית שלנו</li>
                <li><strong>מידע תשלום</strong> - דרך PayPal (אנחנו לא רואים את פרטי הכרטיס שלכם!)</li>
            </ul>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">איך אנחנו משתמשים במידע?</h2>
            <p className="mb-2">הכל מתמקד ביצירת התוכן הטוב ביותר עבורכם:</p>
            <ul className="list-disc pr-5 space-y-1 text-gray-600">
                <li>לזהות אתכם כשאתם חוזרים (לא נעים לשכוח מי אתם...)</li>
                <li>לעקוב אחר הקרדיטים שלכם ולוודא שאתם יכולים להמשיך ליצור</li>
                <li>להפעיל את אלגוריתמי הבינה המלאכותית על התמונות שלכם</li>
            </ul>
            <p className="mt-2 text-gray-600 font-medium">
                <strong>חשוב לדעת:</strong> אנחנו לא שולחים ספאם, לא מציקים בניוזלטרים, ולא מתקשרים בהפתעה. רק Creative Magic טהור!
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">עם מי אנחנו משתפים?</h2>
            <p className="mb-2">רק עם השותפים שעוזרים לנו להפעיל את הקסם:</p>
            <ul className="list-disc pr-5 space-y-1 text-gray-600">
                <li><strong>Google</strong> - כשאתם נכנסים דרך החשבון שלהם</li>
                <li><strong>PayPal</strong> - כשאתם רוכשים קרדיטים (הם המומחים בתשלומים)</li>
            </ul>
            <p className="mt-2 text-gray-600">
                זה הכל! אנחנו לא מוכרים מידע לחברות פרסום או כל מישהו אחר.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">האבטחה שלנו</h2>
            <p className="text-gray-600">
                האתר שלנו מוגן בהצפנה מתקדמת (HTTPS) וכל המידע נשמר בשרתים מאובטחים. אבל בואו נהיה כנים - אין דבר כזה אבטחה 100%, אז תשמרו גם אתם על עצמכם!
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">כמה זמן אנחנו שומרים?</h2>
            <p className="text-gray-600">
                כל עוד אתם איתנו, אנחנו שומרים את הכל. רוצים לעזוב? אין בעיה! פשוט כתבו לנו ל-{" "}
                <a href="mailto:mmalt770@gmail.com" className="text-purple-600 underline font-medium">mmalt770@gmail.com</a> ואנחנו נמחק הכל.
            </p>
            <p className="text-gray-600 mt-2">
                <strong>שימו לב:</strong> תמונות שכבר עיבדנו עלולות להישאר זמן קצר במערכת מסיבות טכניות, אבל לא נעשה איתן כלום.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">הזכויות שלכם</h2>
            <p className="text-gray-600">אתם הבוסים של המידע שלכם! תוכלו:</p>
            <ul className="list-disc pr-5 space-y-1 text-gray-600 mt-2">
                <li>לראות בדיוק מה יש לנו עליכם</li>
                <li>לבקש לתקן או למחוק משהו</li>
                <li>להגיד לנו "די, לא רוצה יותר"</li>
            </ul>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">עדכונים</h2>
            <p className="text-gray-600">
                אם נשנה משהו חשוב כאן, אנחנו נודיע באתר. מבטיחים שלא נעשה שינויים בלי להגיד לכם!
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">יש שאלות?</h2>
            <p className="text-gray-600">
                מבולבלים? לא בטוחים במשהו? כתבו לנו ל-{" "}
                <a href="mailto:mmalt770@gmail.com" className="text-purple-600 underline font-medium">mmalt770@gmail.com</a> ואנחנו נעזור לכם להבין הכל!
            </p>
        </section>
    </div>
  );
}