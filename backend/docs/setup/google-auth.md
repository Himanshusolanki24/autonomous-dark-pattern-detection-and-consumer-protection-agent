# Google OAuth Setup

The dashboard signs in with Google (Supabase-hosted OAuth).

## 1. Google Cloud Console

1. Go to https://console.cloud.google.com/apis/credentials
2. Create an **OAuth 2.0 Client ID** (Application type: Web application).
3. Add authorized redirect URIs:
   - Local: `http://localhost:54321/auth/v1/callback`
   - Hosted: `https://<your-project-ref>.supabase.co/auth/v1/callback`

## 2. Supabase Auth settings

1. Dashboard → Authentication → Providers → Google.
2. Enable Google.
3. Paste the **Client ID** and **Client Secret** from step 1.
4. Save.

## 3. Backend env vars

```bash
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

These are used by Supabase's server; the backend itself only needs:

```bash
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
```

## 4. Redirect after auth

The frontend redirects to `/auth/callback?code=...&next=<route>` after Google
returns. `app/auth/callback/route.ts` exchanges the code for a session, upserts
the profile, and forwards to `next` (default `/dashboard`).

## Notes

- The callback route is served by the backend app, so point the frontend's
  "sign in" button at the backend's `/auth/callback` endpoint or use the
  Supabase client's built-in `signInWithOAuth({ provider: "google" })` and set
  the redirect in the Google console to this backend's callback.
- The service-role key must never be used in browser code.