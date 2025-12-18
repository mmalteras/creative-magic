# 🚀 מדריך הגדרת Supabase - צעד אחר צעד

## מה אתה צריך לעשות ולמה?

האפליקציה שלך עכשיו משתמשת ב-**Supabase** - שירות שמספק:
- 📊 **דטאבייס** - לשמור פרויקטים, משתמשים וכו'
- 🔐 **התחברות** - Google ו-Magic Link (קוד למייל)
- 📁 **אחסון קבצים** - לתמונות שנוצרות

**למה אני לא יכול לעשות את זה בעצמך?**
Supabase זה אתר שדורש התחברות לחשבון שלך. אני יכול לכתוב קוד, אבל לא להתחבר לאתרים בשמך.

---

## 📋 שלב 1: הרצת ה-SQL (יצירת הטבלאות)

### מה זה עושה?
יוצר את כל הטבלאות בדטאבייס שהאפליקציה צריכה.

### איך לעשות:

1. **פתח** את הקישור: https://supabase.com/dashboard/project/ivdemouplrmgwixgupjb

2. **בתפריט השמאלי**, לחץ על **SQL Editor** (אייקון של קוד)
   
3. **לחץ** על **+ New query** (כפתור ירוק למעלה)

4. **העתק את כל הקוד** מהקובץ `supabase-schema.sql` שנמצא בתיקיית הפרויקט:
   ```
   /Users/menachemalt/Downloads/creative-magic/supabase-schema.sql
   ```

5. **הדבק** את הקוד בעורך

6. **לחץ** על **Run** (או Cmd+Enter)

7. **וודא** שקיבלת הודעת הצלחה (Success)

---

## 📁 שלב 2: יצירת Storage Buckets (אחסון קבצים)

### מה זה עושה?
יוצר "תיקיות" לאחסון התמונות שהמשתמשים מעלים ויוצרים.

### איך לעשות:

1. **בתפריט השמאלי**, לחץ על **Storage** (אייקון של תיקיה)

2. **לחץ** על **New bucket**

3. **צור Bucket ראשון:**
   - **Name:** `public-files`
   - **Public bucket:** ✅ סמן V
   - לחץ **Create bucket**

4. **לחץ שוב** על **New bucket**

5. **צור Bucket שני:**
   - **Name:** `private-files`
   - **Public bucket:** ❌ לא לסמן
   - לחץ **Create bucket**

---

## 🔐 שלב 3: הפעלת התחברות עם Google

### מה זה עושה?
מאפשר למשתמשים להתחבר עם חשבון Google שלהם.

### איך לעשות:

1. **בתפריט השמאלי**, לחץ על **Authentication**

2. **לחץ** על **Providers** (בתפריט העליון)

3. **מצא** את **Google** ברשימה ולחץ עליו

4. **הפעל** את הטוגל (Enable Sign in with Google)

5. **עכשיו צריך Create Credentials ב-Google:**

   א. פתח: https://console.cloud.google.com/apis/credentials
   
   ב. בחר או צור פרויקט
   
   ג. לחץ **+ CREATE CREDENTIALS** → **OAuth client ID**
   
   ד. בחר **Web application**
   
   ה. **שם:** `Creative Magic`
   
   ו. **Authorized redirect URIs** - הוסף:
      ```
      https://ivdemouplrmgwixgupjb.supabase.co/auth/v1/callback
      ```
   
   ז. לחץ **Create**
   
   ח. **העתק** את ה-Client ID וה-Client Secret

6. **חזור ל-Supabase** והדבק:
   - **Client ID** בשדה המתאים
   - **Client Secret** בשדה המתאים

7. **לחץ** על **Save**

---

## ✉️ שלב 4: הפעלת Magic Link (קוד למייל)

### מה זה עושה?
מאפשר למשתמשים להתחבר עם מייל - הם מקבלים קוד למייל ומזינים אותו.

### איך לעשות:

Magic Link כבר מופעל כברירת מחדל ב-Supabase! 🎉

**אופציונלי - התאמה אישית:**

1. **Authentication** → **Email Templates**

2. שנה את הטקסט לעברית:
   ```
   שלום,
   
   לחץ על הקישור הבא להתחברות:
   {{ .ConfirmationURL }}
   
   או הזן את הקוד: {{ .Token }}
   ```

---

## 📘 שלב 5: הפעלת התחברות עם Facebook (אופציונלי)

### מה זה עושה?
מאפשר למשתמשים להתחבר עם חשבון Facebook שלהם.

### איך לעשות:

1. **פתח** את הקישור: https://developers.facebook.com/

2. **לחץ** על **My Apps** → **Create App**

3. **בחר** סוג אפליקציה: **Consumer**

4. **שם האפליקציה:** `Creative Magic`

5. **לאחר היצירה**, לך ל-**Settings** → **Basic**:
   - העתק את **App ID**
   - העתק את **App Secret** (לחץ על Show)

6. **בתפריט השמאלי**, לחץ על **Add Product** → **Facebook Login** → **Set Up**

7. **לחץ** על **Facebook Login** → **Settings** והוסף:
   ```
   Valid OAuth Redirect URIs:
   https://ivdemouplrmgwixgupjb.supabase.co/auth/v1/callback
   ```

8. **חזור ל-Supabase Dashboard**:
   - לך ל-**Authentication** → **Providers**
   - מצא את **Facebook** ולחץ עליו
   - הפעל את הטוגל
   - הדבק את **App ID** ו-**App Secret**
   - לחץ **Save**

---

## 🍎 שלב 6: הפעלת התחברות עם Apple (אופציונלי)

### ⚠️ שים לב!
Apple Sign In דורש **חשבון Apple Developer בתשלום** ($99/שנה).
אם אין לך חשבון כזה, דלג על שלב זה.

### איך לעשות:

1. **פתח** את הקישור: https://developer.apple.com/account

2. **לך ל** Certificates, Identifiers & Profiles → **Identifiers**

3. **לחץ** על **+** וצור **App ID**:
   - **Description:** Creative Magic
   - **Bundle ID:** com.creativemagic.app (או משהו דומה)
   - סמן V ליד **Sign In with Apple**
   - לחץ **Continue** → **Register**

4. **לחץ שוב** על **+** וצור **Services ID**:
   - **Description:** Creative Magic Web
   - **Identifier:** com.creativemagic.web
   - לחץ **Continue** → **Register**

5. **לחץ על ה-Service ID** שיצרת ואז על **Configure** ליד Sign In with Apple:
   - **Primary App ID:** בחר את ה-App ID שיצרת
   - **Domains and Subdomains:** `ivdemouplrmgwixgupjb.supabase.co`
   - **Return URLs:** `https://ivdemouplrmgwixgupjb.supabase.co/auth/v1/callback`
   - לחץ **Save**

6. **צור Private Key**:
   - לך ל-**Keys** ולחץ **+**
   - **Key Name:** Creative Magic Auth Key
   - סמן V ליד **Sign In with Apple**
   - לחץ **Configure** ובחר את ה-App ID
   - לחץ **Continue** → **Register**
   - **הורד את הקובץ** (.p8) - שמור אותו במקום בטוח!
   - **העתק** את ה-**Key ID**

7. **חזור ל-Supabase Dashboard**:
   - לך ל-**Authentication** → **Providers**
   - מצא את **Apple** ולחץ עליו
   - הפעל את הטוגל
   - מלא את הפרטים:
     - **Client ID:** ה-Service ID (com.creativemagic.web)
     - **Secret Key:** תוכן קובץ ה-.p8 שהורדת
     - **Key ID:** מה-Key שיצרת
     - **Team ID:** נמצא ב-Membership (בפינה הימנית העליונה)
   - לחץ **Save**

---

## ✅ שלב 7: בדיקה סופית

1. **הפעל את האפליקציה:**
   ```bash
   cd /Users/menachemalt/Downloads/creative-magic
   npm run dev
   ```

2. **פתח בדפדפן:** http://localhost:5173

3. **נסה להתחבר** עם Google, Facebook, Apple או עם מייל

---

## 🆘 פתרון בעיות נפוצות

### "לא מצליח להתחבר עם Google"
- וודא שהכנסת את ה-Redirect URI הנכון ב-Google Console
- וודא שהפעלת את Google Provider ב-Supabase

### "לא מצליח להתחבר עם Facebook"
- וודא שהאפליקציה ב-Facebook במצב Live (לא Development)
- לך ל-App Review → Permissions and Features ובקש את `email` permission
- וודא שה-Redirect URI נכון

### "לא מצליח להתחבר עם Apple"
- וודא שיש לך חשבון Apple Developer בתשלום
- וודא שה-Service ID מוגדר נכון עם ה-Return URL
- בדוק שה-Private Key לא פג תוקף

### "הטבלאות לא נוצרו"
- וודא שהרצת את כל ה-SQL (לא רק חלק)
- חפש הודעות שגיאה באדום

### "לא מצליח להעלות תמונות"
- וודא שיצרת את שני ה-Buckets
- וודא ש-`public-files` מסומן כ-Public

---

## 📞 צריך עזרה?

אם נתקעת בשלב כלשהו, שתף איתי:
1. באיזה שלב אתה
2. מה הודעת השגיאה (אם יש)
3. צילום מסך אם אפשר

ואני אעזור לך להמשיך! 💪

