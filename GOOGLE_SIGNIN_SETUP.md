# Setting up "Sign in with Google" (Google Cloud)

Step-by-step guide to turn on the **Continue with Google** button on the SelfScore sign-in and sign-up pages.

**How it works:** the user clicks our full-width **Continue with Google** button, which opens Google's popup. When they pick their account, Google gives the browser a one-time code. Our server swaps that code (using the client **secret**) for Google's signed ID token, verifies it, and signs the user in with our normal session cookie. We only ask Google for the user's **name, email and profile picture**. No redirect URL or Google API needs to be enabled.

**Time needed:** about 15 minutes.

---

## Before you start

- You need a Google Cloud account with permission to edit a project (Owner or Editor).
- Have these addresses ready:
  - Local: `http://localhost:3000`
  - Staging: your staging site URL (e.g. `https://staging.selfscore.net`), if you have one
  - Live: `https://www.selfscore.net` and `https://selfscore.net`
- Have these links ready for the consent screen:
  - Privacy policy: `https://www.selfscore.net/privacy-policy`
  - Terms: `https://www.selfscore.net/terms-conditions`
  - Logo: `client/public/images/logos/Logo.png` (square, 120×120 px works best)

> Google sometimes renames menu items. If a name below doesn't match exactly, look for the closest match. In the newer console, the consent screen settings live under **Google Auth Platform**.

---

## Step 1 — Pick the Google Cloud project

1. Go to <https://console.cloud.google.com/>.
2. Use the project picker at the top to choose the project.
   - **Recommended:** use the same project as the consultant Google Calendar integration, if you have one. Its consent screen is already partly set up.
   - Otherwise click **New project** and name it e.g. `SelfScore`.

---

## Step 2 — Set up the consent screen (what users see when they choose Google)

Go to **APIs & Services → OAuth consent screen**. In the newer console this is **Google Auth Platform**, with **Branding**, **Audience** and **Data access** in the left menu.

If it asks you to **Get started**, fill in:

| Field | Value |
|---|---|
| App name | `SelfScore` |
| User support email | your support email |
| Audience / User type | **External** (anyone with a Google account can sign in) |
| Developer contact email | your team's email |

Then set the details below.

### 2a. Branding
| Field | Value |
|---|---|
| App logo | `Logo.png` (optional — see note below) |
| Application home page | `https://www.selfscore.net` |
| Privacy policy link | `https://www.selfscore.net/privacy-policy` |
| Terms of service link | `https://www.selfscore.net/terms-conditions` |
| Authorized domains | `selfscore.net` |

> **About the logo:** uploading a logo means Google has to review your branding before the logo shows (usually a few days). Sign-in still works in the meantime. If you'd rather skip the review, leave the logo out.

### 2b. Data access (scopes)
Click **Add or remove scopes** and tick only these three:
- `openid`
- `.../auth/userinfo.email`
- `.../auth/userinfo.profile`

All three are **non-sensitive**, so Google doesn't need to review the app for them. Don't add any other scopes.

### 2c. Audience / publishing status — important
- A new app starts in **Testing** mode. In Testing, **only the Google accounts listed under "Test users" can sign in**. Everyone else sees "Access blocked".
- **For local testing:** add your team's Gmail addresses under **Test users**.
- **Before going live:** click **Publish app** (switch to **In production**). Because we only use basic scopes, this normally takes effect straight away.

---

## Step 3 — Create the OAuth client ID

1. Go to **APIs & Services → Credentials**. In the newer console this is **Google Auth Platform → Clients**.
2. Click **+ Create credentials → OAuth client ID**.
3. **Application type:** `Web application`.
4. **Name:** `SelfScore Web – Sign in with Google` (only visible to your team).
5. **Authorized JavaScript origins**: add each of these on its own line:
   ```
   http://localhost:3000
   https://www.selfscore.net
   https://selfscore.net
   https://<your-staging-domain>        ← if you have staging
   https://<branch>.<id>.amplifyapp.com ← only if people test on the Amplify URL
   ```
   Each origin must be **just the scheme and host**: no path and no trailing slash. `http://localhost:3000/` with a trailing slash is wrong.
6. **Authorized redirect URIs:** leave **empty**. The popup flow doesn't use them.
7. Click **Create**.
8. Copy the **Client ID** (looks like `1234567890-abc123def456.apps.googleusercontent.com`) and the **Client secret** (starts with `GOCSPX-`).
   - The secret goes **only** on the server. Never put it in the client or in git.

> **Reusing the calendar client instead?** You can. Open the existing Web client used for Google Calendar (its ID is `GOOGLE_CLIENT_ID` in `server/.env`), add the JavaScript origins from step 5, and save. **Don't** change or remove its existing redirect URIs, or the consultant calendar connection will break. A separate client (as above) keeps the two independent, which is why it's recommended.

Changes to origins can take **5 minutes to a few hours** to start working.

---

## Step 4 — Add the Client ID to the app

Both the client and the server need the **same** Client ID. Only the server gets the secret.

### Local development

`client/.env.local`
```env
NEXT_PUBLIC_GOOGLE_CLIENT_ID=1234567890-abc123def456.apps.googleusercontent.com
```

`server/.env`
```env
GOOGLE_AUTH_CLIENT_ID=1234567890-abc123def456.apps.googleusercontent.com
GOOGLE_AUTH_CLIENT_SECRET=GOCSPX-...
```

Then **restart both** dev servers. Next.js only reads `NEXT_PUBLIC_*` values when it starts or builds, so refreshing the page isn't enough.

### Staging / live

**Client (AWS Amplify):**
1. Amplify console → your app → **Hosting → Environment variables** (or **App settings → Environment variables**).
2. Add `NEXT_PUBLIC_GOOGLE_CLIENT_ID` = your Client ID. Set it per branch if staging and live use different values.
3. **Redeploy** the branch. The value is baked in at build time, so existing builds won't pick it up.

**Server (EC2 + PM2):**
1. Add `GOOGLE_AUTH_CLIENT_ID` and `GOOGLE_AUTH_CLIENT_SECRET` wherever the production server reads its environment variables. Typically that's the `env` block in `/home/ubuntu/self-score/ecosystem.config.js`, or a `.env` file that PM2 loads.
   - ⚠️ The deploy workflow **replaces the whole `server/` folder** on every deploy. Don't put the value in a file inside `server/` on the box, or the next deploy will wipe it.
2. Restart the process so it picks up the value, e.g. `pm2 reload ecosystem.config.js --only self-score --update-env`.

---

## Step 5 — Test it

Do this locally first, then on staging, then on live.

- [ ] The **Continue with Google** button shows on `/auth/signin`, `/auth/signup`, and in the sign-up popup (e.g. after finishing Level 1 while signed out).
- [ ] **New user:** Google sign-in creates the account, lands on `/onboarding`, and the account shows as verified, with no "Verify your email" reminder.
- [ ] **Returning user:** a second Google sign-in goes straight to the dashboard.
- [ ] **Existing email + password user:** signing in with Google using the same Gmail links to the same account (same test history). The password still works afterwards.
- [ ] **Level 4 purchase** with a Google account only asks for profile details if they were skipped, never for email verification.
- [ ] Profile page → "Sign-in method" shows **Google**.
- [ ] **Live only:** an account that is **not** a test user can sign in. This confirms the app is published.

---

## Troubleshooting

| What you see | Cause | Fix |
|---|---|---|
| No Google button at all | `NEXT_PUBLIC_GOOGLE_CLIENT_ID` missing at build time | Add it, then restart the dev server or redeploy Amplify |
| Google popup: **"Error 400: origin_mismatch"** / "The given origin is not allowed for the given client ID" | The site's address isn't in Authorized JavaScript origins | Add the exact origin (scheme + host + port, no trailing slash) and wait a few minutes |
| **"Access blocked: SelfScore has not completed the Google verification process"** or only some people can sign in | App still in **Testing** mode | Add the person as a test user, or **Publish app** |
| Popup works, then the page says **"Google sign-in failed. Please try again."** | Server's `GOOGLE_AUTH_CLIENT_ID` differs from the client's ID, or `GOOGLE_AUTH_CLIENT_SECRET` is wrong/reset (log shows `invalid_client` / `invalid_grant`) | Use the same ID in both places, the current secret for that client, and restart the server |
| **"Google sign-in is not configured."** | Server is missing `GOOGLE_AUTH_CLIENT_ID` or `GOOGLE_AUTH_CLIENT_SECRET` | Set both and restart |
| **"This email is already linked to a different Google account."** | The SelfScore account was linked to another Google account earlier | Sign in with email + password (or an email code) instead |
| **"Your Google account email isn't verified."** | Rare: the Google account's own email isn't verified with Google | User verifies it with Google, or signs up with email + password |
| "Couldn't open the Google window" / nothing happens | Browser blocking popups | Allow popups for the site, or try another browser. Email + password always works as a fallback |
| Server log warns "GOOGLE_AUTH_CLIENT_ID not set — falling back to GOOGLE_CLIENT_ID" | Only the calendar client ID is set | Fine if that client has the JavaScript origins added; otherwise set `GOOGLE_AUTH_CLIENT_ID` |

---

## Quick reference

| Setting | Where | Value |
|---|---|---|
| Application type | Google Cloud → OAuth client | Web application |
| Authorized JavaScript origins | Google Cloud → OAuth client | `http://localhost:3000`, `https://www.selfscore.net`, `https://selfscore.net`, staging URL |
| Authorized redirect URIs | Google Cloud → OAuth client | *(none)* |
| Scopes | Consent screen → Data access | `openid`, `email`, `profile` |
| Publishing status | Consent screen → Audience | **In production** before launch |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | `client/.env.local` / Amplify env vars | Client ID |
| `GOOGLE_AUTH_CLIENT_ID` | `server/.env` / production server env | Same Client ID |
| `GOOGLE_AUTH_CLIENT_SECRET` | `server/.env` / production server env (never the client) | Client secret |

For how the whole sign-in system works (email verification, the Level 4 gate, reminders), see `USER_AUTH_GUIDE.md`.
