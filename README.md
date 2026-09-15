# זה זמן בשביל!! 🏸

אפליקציית מעקב סטטיסטיקות לליגת בדמינטון פרטית — שחקנים, משחקים, ערבים, הישגים והשוואות ראש-בראש.

## הרצה מקומית

פתחו את `index.html` בדפדפן. האפליקציה היא קובץ HTML יחיד (React + Babel בדפדפן, ללא build step).

## פתיח קולנועי

פתיח של כ־6 שניות: חבטת Three.js, חשיפת תמונת הקבוצה בתנועת מצלמה וכניסה למסך הבית. אפשר לדלג בכפתור או ב־Escape, ולצפות שוב ממסך הבית. העדפת מערכת להפחתת תנועה מדלגת על הפתיח. האנימציה ללא פסקול.

סצנת החבטה ב־`assets/cinematic-scene.js`, התמונה ב־`assets/team-cinematic.png` והעיצוב ב־`assets/cinematic.css`; יש לכלול את תיקיית `assets` בפריסה. בתצוגת טלפון התמונה מוצגת לרוחבה כדי לשמור את ארבעת השחקנים בפריים.

## פריסה ל-Netlify

חברו את הריפו הזה לאתר חדש ב-Netlify (New site from Git). אין צורך בפקודת build — קובץ ה-publish הוא `.` (root), כמוגדר ב-`netlify.toml`.

## מסד נתונים (Supabase)

הנתונים משותפים לכל הקבוצה דרך Supabase. ראו `supabase/schema.sql` להקמת הטבלאות, ועדכנו את `SUPABASE_URL` / `SUPABASE_ANON_KEY` בתחילת `index.html`.

אם הטבלאות כבר קיימות מפעם קודמת (לפני שיאים/אבני דרך/ניצחון טכני), יש להריץ פעם אחת ב-SQL Editor:
```sql
alter table matches add column if not exists "isTechnicalWin" boolean not null default false;
alter table matches add column if not exists "technicalWinType" text;
```

לאחר החיבור, ניתן לייבא את הגיבוי הקיים (`backup/`) דרך מסך ההגדרות באפליקציה → "שחזור מגיבוי…".
