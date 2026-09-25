# GFI Lead Dashboard

Lead tracker and content planner for social-media work across LinkedIn, Facebook, Instagram, and TikTok.
Next.js (App Router), TypeScript, Tailwind CSS, Firebase Auth + Firestore. No automation or messaging features.

## 1. Set up Firebase

1. In the [Firebase console](https://console.firebase.google.com), create a project.
2. **Build > Firestore Database**: create a database (production mode).
3. **Build > Authentication > Sign-in method**: enable **Email/Password**.
4. **Project settings > Your apps**: add a **Web app** and copy its config values.

## 2. Add your admins

Only accounts you add here can use the app. There is no sign-up page.

1. **Authentication > Users > Add user**: enter the admin's email and a password. Copy the user's **UID**.
2. **Firestore Database > Start collection**: collection ID `admins`. For the document ID, paste the UID.
   Add any field, for example `email` (string).
3. Repeat for each admin.

An account without an `admins/{uid}` document can sign in but sees "This account isn't an admin" and cannot read or write any data.

## 3. Deploy the security rules

Paste the contents of `firestore.rules` into **Firestore Database > Rules** and publish
(or run `firebase deploy --only firestore:rules` if you use the Firebase CLI).

## 4. Run it

```bash
cp .env.local.example .env.local   # then fill in the Firebase values
npm install
npm run dev
```

Open http://localhost:3000 and sign in.

## Deploying

Vercel works well: import the repo and add the same six `NEXT_PUBLIC_FIREBASE_*` variables.
Then add your deployed domain under **Authentication > Settings > Authorized domains**.

## Data layout

```
admins/{uid}                 marker document that grants admin access
users/{uid}/leads/{id}       name, platform, profileUrl, category, status, notes,
                             followUpDate (YYYY-MM-DD), followUpDone, createdAt, updatedAt
users/{uid}/content/{id}     title, platform, contentType, status,
                             scheduledDate (YYYY-MM-DD), notes, createdAt, updatedAt
```

Each admin sees only their own leads and content.
