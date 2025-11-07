# Firebase SSO Guide — MediQ & AyurDost

This guide explains how MediQ and AyurDost (AyurChat) share the same Firebase project to deliver seamless Single Sign-On (SSO). Users who authenticate on either application stay logged in across both products automatically.

---

## Table of Contents

1. [Overview](#overview)
2. [Shared Firebase Project Setup](#shared-firebase-project-setup)
3. [Frontend Configuration](#frontend-configuration)
4. [Backend Configuration](#backend-configuration)
5. [Cross-Domain Session Flow](#cross-domain-session-flow)
6. [Local Development Tips](#local-development-tips)
7. [Troubleshooting](#troubleshooting)
8. [Reference Checklist](#reference-checklist)

---

## Overview

Both applications rely on **the same Firebase project**. Each app registers as a Firebase Web client and uses identical authentication providers (Email/Password + Google). Because Firebase Auth stores its session in first-party cookies scoped to the auth domain, users stay logged in when moving between MediQ and AyurDost.

Key points:
- One Firebase project powers both apps
- Each app uses Firebase Auth for sign-in and reads the same session cookie
- Express backends validate requests using Firebase Admin and the same service account

---

## Shared Firebase Project Setup

1. **Create (or select) a Firebase project** in the [Firebase console](https://console.firebase.google.com/).
2. **Enable Authentication** and turn on the providers you need (Email/Password, Google, etc.).
3. **Add two Web apps** under the same project:
   - One for `mediq.example.com` (or local dev origin)
   - One for `ayurdost.example.com` (or local dev origin)
4. **Configure Authorized Domains** for both applications in Firebase Authentication settings. Include:
   - `localhost` (for local development)
   - Production domains for MediQ and AyurDost

---

## Frontend Configuration

Each app needs environment variables for the same Firebase project.

```
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_MEASUREMENT_ID=... # optional
```

### Authentication Flow

1. The user signs in (Email/Password or Google) via Firebase Auth from either app.
2. Firebase persists the session in its auth cookie (`__session`), shared because both apps use the same auth domain.
3. The React apps listen to `onAuthStateChanged`, update global state, and fetch the ID token via `getIdToken()` for API calls.

No additional token exchange or iframe messaging is required.

---

## Backend Configuration

Both Express servers validate Firebase ID tokens with the same service account.

```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}
```

Steps:
1. Download a service account JSON with **Firebase Admin** permissions.
2. Store the entire JSON as the `FIREBASE_SERVICE_ACCOUNT` environment variable (stringified JSON).
3. The middleware at `server/middleware/verifyFirebaseToken.ts` parses and initializes Firebase Admin.
4. Protected routes use this middleware to populate `req.user` with the decoded token.

Because both backends share a Firebase project, the decoded UID and claims are consistent across apps.

---

## Cross-Domain Session Flow

1. User signs in on MediQ (`mediq.example.com`).
2. MediQ stores the Firebase session cookie in the browser (scoped to the shared auth domain).
3. When the user visits AyurDost (`ayurdost.example.com`), Firebase Auth detects the existing session and auto-logins the user.
4. AyurDost fetches a fresh ID token and sends it to its Express API with `Authorization: Bearer <token>`.
5. AyurDost backend trusts the token because it validates against the same Firebase project.

This also works in reverse (AyurDost → MediQ).

---

## Local Development Tips

- Use unique origins (e.g., `http://localhost:5173` for AyurDost, `http://localhost:5174` for MediQ).
- Both origins must be whitelisted under **Authentication > Settings > Authorized Domains** in Firebase.
- If you see `auth-domain not authorized` errors, double-check the hostnames listed in Firebase.

---

## Troubleshooting

| Issue | Resolution |
| ----- | ---------- |
| Users asked to re-login when switching apps | Ensure both apps use the exact same Firebase project ID and Auth domain. Clear cookies when switching between projects. |
| Backend returns 401 after login | Confirm the frontend includes `Authorization: Bearer <idToken>` and the backend has a valid `FIREBASE_SERVICE_ACCOUNT`. |
| Google sign-in popup blocked | Verify the Firebase Web app has the correct OAuth client IDs configured and the domain is authorized in the Google Cloud console. |
| Token expired errors | Call `getIdToken(true)` on the frontend to force refresh, or rely on Firebase's automatic refresh timers. |

---

## Reference Checklist

- [ ] MediQ and AyurDost point to the same Firebase project ID
- [ ] Both apps include identical `VITE_FIREBASE_*` values
- [ ] `FIREBASE_SERVICE_ACCOUNT` is configured on both backends
- [ ] Authorized domains list includes all dev and production hosts
- [ ] Google OAuth client IDs correspond to the same Firebase project
- [ ] Frontends attach `Authorization: Bearer <token>` to API requests

With this setup, users can move between MediQ and AyurDost without re-authenticating, delivering a unified SSO experience.
