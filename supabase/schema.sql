-- זה זמן בשביל!! — סכימת Supabase
-- הריצו את כל הקובץ הזה פעם אחת ב-Supabase Dashboard → SQL Editor → New query → Run.
-- שמות העמודות תואמים בדיוק לשמות השדות ב-JS (camelCase), כדי שהאפליקציה תעבוד בלי מיפוי נוסף.

create table if not exists nights (
  id text primary key,
  date timestamptz not null,
  title text,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz,
  "endedAt" timestamptz
);

create table if not exists players (
  id text primary key,
  name text not null,
  nickname text,
  "profileImage" text,
  active integer not null default 1,
  "createdAt" timestamptz not null default now()
);

create table if not exists matches (
  id text primary key,
  "matchNightId" text references nights(id) on delete set null,
  "matchDate" timestamptz not null,
  "matchTime" text,
  "generatedByShuffle" boolean not null default false,
  mode text not null,
  "targetScore" integer not null,
  "winBy" integer not null default 2,
  "maxScore" integer,
  "teamAPlayerIds" jsonb not null,
  "teamBPlayerIds" jsonb not null,
  "teamAScore" integer not null,
  "teamBScore" integer not null,
  winner text not null,
  "playerIds" jsonb,
  seq integer not null default 0,
  "createdAt" timestamptz not null default now(),
  "updatedAt" timestamptz
);

create table if not exists settings (
  key text primary key,
  value jsonb
);

-- ---------- Row Level Security ----------
-- האפליקציה משותפת לקבוצה סגורה ללא התחברות (מפתח anon בלבד).
-- המדיניות כאן פתוחה לגמרי (כל אחד עם ה-URL וה-anon key יכול לקרוא/לכתוב) —
-- מספיק לקבוצת חברים פרטית, אך ה-URL/הפרויקט לא באמת "מוגן" מעבר לכך שהוא לא ידוע לציבור.
alter table nights   enable row level security;
alter table players  enable row level security;
alter table matches  enable row level security;
alter table settings enable row level security;

create policy "public read/write nights"   on nights   for all using (true) with check (true);
create policy "public read/write players"  on players  for all using (true) with check (true);
create policy "public read/write matches"  on matches  for all using (true) with check (true);
create policy "public read/write settings" on settings for all using (true) with check (true);

-- ---------- Realtime ----------
-- מאפשר לכל המכשירים לקבל עדכונים חיים כשמישהו שומר משחק/שחקן/ערב.
alter publication supabase_realtime add table nights, players, matches, settings;
