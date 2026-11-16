# User Authentication (Password + Google)

How end users sign up and sign in to SelfScore. Consultant and admin auth are separate and unchanged.

## Summary

| Step | What happens |
|---|---|
| Sign up | Email-first: **Continue with Google**, or enter email → (if it's already registered, sent to sign-in) → name + password (min 8 chars). The user is signed in immediately. |
| Onboarding | `/onboarding` asks for country, gender and age group. "Skip for now" is allowed. |
| Levels 1–3 | Available without verifying the email. |
| Verification | One email with **both** a "Verify my email" link and a 6-digit code (valid 24h). Google accounts are verified automatically. |
| Level 4/5, payments, consultations | Need a **verified email and a complete profile**. Enforced on the server; the client opens a modal that walks the user through what's missing, then continues the action. |
| Reminders | Orange dot on the navbar avatar + "Finish setting up" menu items, dismissible dashboard banner (comes back after 3 days), one-time popup after the first Level 1 result, and one reminder email 3 days after sign-up if still unverified. |
| Existing users (no password) | Sign in with **"Email me a login code instead"**, then they're prompted to set a password (profile page → "Set a password"). "Forgot password" also works for them. |

## Environment variables

### Server (`server/.env`)

| Variable | Required | Notes |
|---|---|---|
| `JWT_SECRET` | **Yes in production** | The server refuses to start in production without it. |
| `GOOGLE_AUTH_CLIENT_ID` | For Google sign-in | OAuth **Web** client ID. Falls back to `GOOGLE_CLIENT_ID` (the calendar client) if not set — recommended to set explicitly. Must match the client's `NEXT_PUBLIC_GOOGLE_CLIENT_ID`. |
| `GOOGLE_AUTH_CLIENT_SECRET` | For Google sign-in | Secret of the same client; used to exchange the popup auth code. (Falls back to `GOOGLE_CLIENT_SECRET` only when the ID also falls back.) |
| `CLIENT_URL` | Yes | Used to build the verification and password-reset links in emails. |
| `OTP_HMAC_SECRET` | Optional | Secret used to hash codes/links. Defaults to `JWT_SECRET`. |
| `DISABLE_VERIFICATION_REMINDERS` | Optional | `true` turns off the reminder email job (e.g. on extra instances or locally). |

### Client (`client/.env.local`)

| Variable | Notes |
|---|---|
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Same Web client ID as the server. If empty, the Google button is hidden. |

## Google Cloud setup

1. Google Cloud Console → APIs & Services → Credentials → your OAuth 2.0 **Web application** client.
2. **Authorized JavaScript origins**: add every site the client runs on, e.g. `http://localhost:3000`, your staging URL, `https://www.selfscore.net`, `https://selfscore.net`.
3. No redirect URI is needed (popup auth-code flow uses `postmessage`). Copy the client secret to the server env.
4. OAuth consent screen: app name, logo, support email, and links to the privacy policy and terms. Scopes used: `openid`, `email`, `profile` only.

## API (`/api/auth`)

| Method | Path | Auth | Purpose |
|---|---|---|---|
| POST | `/sign-up` | – | `{ username, email, password }` → signs in, sends verification email |
| POST | `/login` | – | `{ email, password, rememberMe? }` |
| POST | `/check-email` | – | `{ email }` → `{ exists }` (email-first sign-up; rate limited 30/15 min) |
| POST | `/google` | – | `{ code, rememberMe? }` (popup auth code from the custom button) or `{ credential }` (GIS ID token) |
| POST | `/login/code` | – | `{ email }` → emails a 6-digit login code (same response whether or not the account exists) |
| POST | `/login/code/verify` | – | `{ email, code, rememberMe? }` |
| POST | `/verify-email/send` | ✔ | Resend verification link + code |
| POST | `/verify-email` | ✔ | `{ code }` |
| POST | `/verify-email/link` | must be signed in to that account | `{ token }` from the email link. Signed out → `401 SIGN_IN_REQUIRED` (the page asks them to sign in, then finishes). The link isn't used up by that. |
| GET | `/me` | ✔ | Current user incl. `isVerified`, `isProfileComplete`, `hasPassword`, `authProviders` |
| POST | `/logout` | – | Clears the cookie |
| POST | `/forgot-password` | – | `{ email }` (same response whether or not the account exists) |
| POST | `/reset-password` | – | `{ token, password, confirmPassword }` → signs in, signs out other devices |
| POST | `/password` | ✔ | `{ newPassword, currentPassword? }` set or change password |
| PATCH | `/onboarding` | ✔ | `{ country, gender, ageGroup }` or `{ skip: true }` |

Gated routes respond `403` with `code: "EMAIL_UNVERIFIED"` or `"PROFILE_INCOMPLETE"`:
`POST /api/payment/create-checkout`, `POST /api/ai-interview/start`, `POST /api/realtime-interview/start`, `POST /api/booking/create`, `POST /api/booking/:id/confirm`.

## Security notes

- Passwords: bcrypt (cost 12), 8–72 characters, no composition rules (NIST SP 800-63B).
- 5 wrong passwords lock password sign-in for 15 minutes (email code and Google still work). Per-IP rate limits on all auth endpoints.
- Codes are generated with `crypto.randomInt` and stored only as HMACs; each code allows 5 attempts and is single-use. Links are single-use and replaced when a new email is sent.
- Every session is checked against the database (`tokenVersion`). Password reset, password change, and account takeover protection revoke other sessions.
- **Unverified-account takeover protection**: since sign-up no longer proves email ownership, anyone could register someone else's email. When the real inbox owner proves ownership (login code or Google) on an account that was never verified, the password set by whoever created it is removed and their sessions are ended.
- The verification **link only works while signed in to that account**, so someone who owns the inbox but didn't create the account can't unknowingly verify an account a stranger controls.
- Code attempts are counted atomically, so parallel guessing can't get past the 5-attempt limit.
- WebSocket transcription connections use the same session checks as HTTP requests.
- Test responses/history endpoints require sign-in and only return the signed-in user's data. Admins use `GET /api/admin/users/:userId/responses`.
