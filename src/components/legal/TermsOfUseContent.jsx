import React from "react";

export default function TermsOfUseContent() {
  return (
    <div className="space-y-6 text-gray-700 hebrew-font text-base leading-relaxed">
        <p>
            ברוכים הבאים למשפחה של Creative Magic! כאן אתם הולכים ליצור תמונות ממוזערות שיעשו לכם מיליוני צפיות. בואו נבין יחד מה הכללים של המשחק:
        </p>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">מי אנחנו?</h2>
            <p className="text-gray-600">
                Creative Magic - זה אנחנו! הצוות שיעזור לכם להפוך כל רעיון לתמונה ממוזערת ויראלית. הכללים כאן כתובים בזכר אבל מתייחסים לכולם - גברים, נשים, ובינאריים, כל מי שרוצה ליצור תוכן מדהים!
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">איך מצטרפים למסיבה?</h2>
            <ul className="list-disc pr-5 space-y-1 text-gray-600">
                <li>נרשמים עם אימייל או חשבון Google (קל וזריז!)</li>
                <li>שומרים על הסיסמה בסוד - זה לא משהו לחלוק עם כולם</li>
                <li>אם תתנהגו לא יפה, אנחנו נוכל לחסום אתכם (אבל אנחנו בטוחים שזה לא יקרה 😊)</li>
            </ul>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">איך זה עובד? כסף וקרדיטים</h2>
            <ul className="list-disc pr-5 space-y-1 text-gray-600">
                <li>קונים קרדיטים דרך PayPal (בטוח ומהיר)</li>
                <li>כל קרדיט = יצירה אחת מדהימה</li>
                <li>משלמתם? הקרדיטים מגיעים ישר לחשבון</li>
                <li><strong>חשוב לדעת:</strong> אין החזרים על קרדיטים שלא השתמשתם בהם (אז תיהנו מהם!)</li>
            </ul>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">מעלים תמונות? כמה כללים</h2>
            <ul className="list-disc pr-5 space-y-1 text-gray-600">
                <li>מעלו מה שאתם רוצים - התמונות שלכם, הרעיונות שלכם</li>
                <li><strong>אחריות עליכם:</strong> וודאו שהתמונות חוקיות ושלכם (זכויות יוצרים וכל הבלגן הזה)</li>
                <li>התוצאות שיוצרו? שלכם לחלוטין! אנחנו לא שומרים זכויות עליהן</li>
            </ul>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">אחריות - בואו נהיה כנים</h2>
            <ul className="list-disc pr-5 space-y-1 text-gray-600">
                <li>השירות שלנו מגיע "כמו שהוא" - אנחנו עושים הכל כדי שיהיה מושלם, אבל לא מבטיחים</li>
                <li>אם משהו ישתבש, אנחנו לא אחראים לנזקים (אבל נעשה הכל לתקן!)</li>
                <li>השתמשו בחוכמה - לא לדברים לא חוקיים או פוגעניים</li>
            </ul>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">הקניין הרוחני שלנו</h2>
            <p className="text-gray-600">
                האתר, הטכנולוגיה, העיצוב - הכל שלנו! אתם מוזמנים להשתמש, אבל לא להעתיק או להפיץ בלי לשאול אותנו לפני.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">רוצים לעזוב?</h2>
            <p className="text-gray-600">
                זה יהיה חבל, אבל אם בכל זאת - פשוט כתבו לנו ל-{" "}
                <a href="mailto:mmalt770@gmail.com" className="text-purple-600 underline font-medium">mmalt770@gmail.com</a> ואנחנו נמחק הכל כמו שצריך.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">עדכונים לתקנון</h2>
            <p className="text-gray-600">
                לפעמים אנחנו נצטרך לעדכן את הכללים. כשזה יקרה, אנחנו נפרסם את השינויים באתר כדי שתדעו.
            </p>
        </section>

        <section>
            <h2 className="text-xl font-semibold mb-2 text-gray-800">החוק והמשפטים</h2>
            <p className="text-gray-600">
                הכללים כאן פועלים לפי החוק הישראלי, ואם (חלילה) יהיה צריך להגיע לבית משפט, זה יהיה בתל אביב.
            </p>
        </section>

        <section className="bg-gradient-to-r from-purple-50 to-teal-50 p-4 rounded-lg border border-gray-200">
            <p className="text-gray-700 font-medium text-center">
                🎨 <strong>סיכום:</strong> תיצרו, תיהנו, תתנהגו יפה - ואנחנו נדאג שתקבלו את התוצאות הטובות ביותר! 🎨
            </p>
        </section>
    </div>
  );
}