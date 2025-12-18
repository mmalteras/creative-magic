# 🚀 מדריך העלאה לפרודקשן - Creative Magic

מדריך מלא מקצה לקצה להעלאת האפליקציה לאינטרנט + הכנה לחנויות האפליקציות.

---

## חלק 1: הכנת GitHub Repository

### שלב 1.1 - יצירת קובץ .gitignore
וודא שקובץ `.gitignore` בתיקיית הפרויקט מכיל:
```
node_modules
dist
.env
.env.local
.DS_Store
```

### שלב 1.2 - אתחול Git
הרץ בטרמינל בתיקיית הפרויקט `/Users/menachemalt/Downloads/creative-magic`:
```bash
git init
git add .
git commit -m "Initial commit - Creative Magic"
```

### שלב 1.3 - יצירת Repository ב-GitHub
1. פתח: https://github.com/new
2. **Repository name:** `creative-magic`
3. **Description:** `AI-powered thumbnail generator`
4. **Visibility:** Private (או Public)
5. **אל תסמן** Initialize with README
6. לחץ **Create repository**

### שלב 1.4 - חיבור וי Push
החלף `YOUR_USERNAME` בשם המשתמש שלך:
```bash
git remote add origin https://github.com/YOUR_USERNAME/creative-magic.git
git branch -M main
git push -u origin main
```

---

## חלק 2: העלאה ל-Vercel (עם Auto-Deploy)

### שלב 2.1 - יצירת חשבון Vercel
1. פתח: https://vercel.com/signup
2. לחץ **Continue with GitHub**
3. אשר את החיבור

### שלב 2.2 - Import הפרויקט
1. ב-Dashboard של Vercel לחץ **Add New...** → **Project**
2. מצא את `creative-magic` ברשימה ולחץ **Import**

### שלב 2.3 - הגדרת Environment Variables
בלפני ה-Deploy, הוסף משתני סביבה:

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | `https://ivdemouplrmgwixgupjb.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | (המפתח מקובץ ה-.env שלך) |
| `VITE_GEMINI_API_KEY` | (אם יש - המפתח של Gemini) |

### שלב 2.4 - Deploy
1. לחץ **Deploy**
2. חכה 2-3 דקות
3. תקבל כתובת כמו: `https://creative-magic-xxx.vercel.app`

### שלב 2.5 - Auto-Deploy מופעל!
מעכשיו, כל פעם שתעשה `git push` ל-GitHub, Vercel יעדכן את האתר אוטומטית!

---

## חלק 3: עדכון OAuth Providers (חובה!)

לאחר שיש לך את הכתובת של Vercel, צריך לעדכן:

### שלב 3.1 - עדכון Supabase
1. פתח: https://supabase.com/dashboard/project/ivdemouplrmgwixgupjb/auth/url-configuration
2. ב-**Site URL** הכנס את כתובת Vercel
3. ב-**Redirect URLs** הוסף את כתובת Vercel

### שלב 3.2 - עדכון Google OAuth
1. פתח: https://console.cloud.google.com/apis/credentials
2. לחץ על ה-OAuth Client שלך
3. ב-**Authorized JavaScript origins** הוסף את כתובת Vercel
4. ב-**Authorized redirect URIs** וודא שיש: `https://ivdemouplrmgwixgupjb.supabase.co/auth/v1/callback`

### שלב 3.3 - עדכון Facebook OAuth
1. פתח: https://developers.facebook.com/apps/1852175085410050/settings/basic/
2. ב-**App Domains** הוסף את הדומיין של Vercel (בלי https://)
3. ב-**Facebook Login → Settings → Valid OAuth Redirect URIs** וודא שיש את ה-callback של Supabase

---

## חלק 4: הוספת Capacitor (לאפליקציות iOS/Android)

### שלב 4.1 - התקנת Capacitor
בתיקיית הפרויקט הרץ:
```bash
npm install @capacitor/core @capacitor/cli
npx cap init "Creative Magic" "com.creativemagic.app"
```

### שלב 4.2 - בנייה
```bash
npm run build
```

### שלב 4.3 - הוספת פלטפורמות
```bash
npm install @capacitor/ios @capacitor/android
npx cap add ios
npx cap add android
```

### שלב 4.4 - עדכון capacitor.config.ts
פתח את הקובץ `capacitor.config.ts` ועדכן:
```typescript
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.creativemagic.app',
  appName: 'Creative Magic',
  webDir: 'dist',
  server: {
    // For production, remove this block
    // For development only:
    // url: 'http://YOUR_LOCAL_IP:5173',
    // cleartext: true
  }
};

export default config;
```

### שלב 4.5 - סנכרון
אחרי כל שינוי בקוד:
```bash
npm run build
npx cap sync
```

---

## חלק 5: פתיחה ב-Xcode / Android Studio

### ל-iOS (דורש Mac):
```bash
npx cap open ios
```
ב-Xcode:
1. בחר Team (Apple Developer Account)
2. לחץ על כפתור ה-Play להרצה בסימולטור

### ל-Android:
```bash
npx cap open android
```
ב-Android Studio:
1. חכה ל-Gradle sync
2. לחץ Run

---

## חלק 6: העלאה לחנויות (כשתהיה מוכן)

### App Store (iOS):
1. ב-Xcode: Product → Archive
2. פתח Organizer → Distribute App
3. אפשרות: App Store Connect
4. העלה ומלא את הפרטים ב-App Store Connect

### Google Play:
1. ב-Android Studio: Build → Generate Signed Bundle/APK
2. בחר Android App Bundle
3. צור/השתמש ב-Keystore
4. העלה ל-Google Play Console

---

## 📋 רשימת בדיקה סופית

- [ ] הקוד ב-GitHub
- [ ] Vercel מחובר ו-Auto-deploy עובד
- [ ] Site URL מעודכן ב-Supabase
- [ ] Google OAuth מעודכן עם הדומיין החדש
- [ ] Facebook OAuth מעודכן
- [ ] Capacitor מותקן (לאפליקציות)
- [ ] iOS app עובד בסימולטור
- [ ] Android app עובד באמולטור

---

## 🔄 עדכון עתידי

כשתרצה לעדכן את האפליקציה:

### לאתר (אוטומטי):
```bash
git add .
git commit -m "תיאור השינוי"
git push
```
Vercel יעדכן אוטומטית תוך 2-3 דקות.

### לאפליקציות:
```bash
npm run build
npx cap sync
npx cap open ios  # או android
```
ואז Archive מחדש ב-Xcode/Android Studio.

---

## 🆘 פתרון בעיות

### "Vercel build נכשל"
- בדוק שכל ה-Environment Variables מוגדרים
- בדוק ש-`npm run build` עובד מקומית

### "OAuth לא עובד באתר החי"
- וודא שהוספת את הדומיין של Vercel לכל ה-OAuth providers
- וודא שה-Site URL ב-Supabase מעודכן

### "האפליקציה לא נטענת ב-Capacitor"
- וודא שעשית `npm run build` לפני `npx cap sync`
- בדוק שה-webDir ב-capacitor.config.ts הוא `dist`
