# Hamrah — NIT Srinagar Rideshare

A small React + Firebase app for coordinating shared rides (to the railway
station, on trips, etc.) between students, instead of spamming the hostel
WhatsApp group every time.

- **Find a ride** — search by from/to and book a seat on someone's ride
- **Your booked rides** — rides you've booked, with the option to cancel
- **Your initiated rides** — rides you've posted, and who has booked them
  (with their mobile number)
- **Profile** — your name, mobile number and hostel/branch

Login is email + password (any email works, no college-domain check).

## 1. Create a Firebase project (free)

1. Go to <https://console.firebase.google.com/> and click **Add project**.
   Name it whatever you like (e.g. "nit-srinagar-rideshare"). You can skip
   Google Analytics.
2. In your new project, click the **</>** (web) icon to register a web app.
   Give it a nickname, you don't need Firebase Hosting checked at this step.
3. Firebase will show you a `firebaseConfig` object with keys like
   `apiKey`, `authDomain`, `projectId`, etc. Keep this tab open.
4. In the left sidebar, go to **Build → Authentication → Get started**,
   and enable the **Email/Password** sign-in provider.
5. Go to **Build → Firestore Database → Create database**. Start in
   **production mode** (the rules file in this project will take care of
   access control), pick a region close to you (e.g. `asia-south1` for
   Mumbai), and create it.

## 2. Configure this project

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```
2. Fill in `.env` with the values from your `firebaseConfig` (step 1.3
   above):
   ```
   VITE_FIREBASE_API_KEY=...
   VITE_FIREBASE_AUTH_DOMAIN=...
   VITE_FIREBASE_PROJECT_ID=...
   VITE_FIREBASE_STORAGE_BUCKET=...
   VITE_FIREBASE_APP_ID=...
   ```

## 3. Deploy the security rules

The rules in `firestore.rules` make sure students can only edit their own
profile and only delete rides they created. Easiest way to apply them:

1. Open your project in the Firebase console → **Firestore Database → Rules**.
2. Paste in the contents of `firestore.rules` from this project and click
   **Publish**.

(If you have the Firebase CLI installed, `firebase deploy --only firestore:rules`
works too, once you run `firebase init` and point it at this project.)

## 4. Run it locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:5173`). Sign up with a
name, mobile number, hostel/branch, an email and a password — every
student who wants to use it does the same, from any device.

## 5. Put it online for everyone to use

The easiest free option is **Vercel** or **Netlify**:

1. Push this folder to a GitHub repo.
2. On [vercel.com](https://vercel.com) (or [netlify.com](https://netlify.com)),
   import the repo.
3. Add the same five `VITE_FIREBASE_*` variables from your `.env` file as
   **Environment Variables** in the project settings there.
4. Deploy. You'll get a public URL you can share with your hostel/branch
   group instead of the "send a message if you need a ride" routine.

## Notes and things you may want to extend

- **Auth is email/password with no domain check**, per your call — anyone
  with the link can sign up. If you later want to restrict it to
  `@nitsrinagar.ac.in` addresses, add a check in `AuthScreen.jsx`'s submit
  handler before calling `createUserWithEmailAndPassword`.
- **Booking is "first come, first served"** — the app re-reads the ride
  right before booking to avoid two people grabbing the last seat, but
  there's no payment or fare-splitting logic; that's left to the group
  chat, on purpose.
- **Mobile numbers are visible** to anyone signed in who views a ride (as
  you asked for), so treat this the same way you'd treat a shared spreadsheet
  — only share the link with people you trust.
- The Firestore free tier (Spark plan) comfortably covers a single
  college's traffic for this kind of app.
