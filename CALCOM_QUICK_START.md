# Cal.com Integration - Quick Start Guide

## 🚀 Quick Setup (5 Minutes)

### Step 1: Register with Cal.com

1. Go to https://app.cal.com/settings/developer
2. Create OAuth App:
   - **Name**: LifeScore Platform
   - **Redirect URI**: `http://localhost:3000/consultant/calcom/callback`
3. Copy your `client_id` and `client_secret`

### Step 2: Configure Environment Variables

Add to `/server/.env`:

```env
CALCOM_CLIENT_ID=your_client_id_here
CALCOM_CLIENT_SECRET=your_client_secret_here
CALCOM_REDIRECT_URI=http://localhost:3000/consultant/calcom/callback
CALCOM_WEBHOOK_SECRET=generate_random_string_here
CALCOM_API_URL=https://api.cal.com/v1
SERVER_URL=http://localhost:5001
```

**Generate webhook secret**:

```bash
openssl rand -hex 32
```

### Step 3: Test the Integration

1. **Start your servers**:

   ```bash
   # Terminal 1 - Backend
   cd server
   npm run dev

   # Terminal 2 - Frontend
   cd client
   npm run dev
   ```

2. **Login as consultant** (approved consultant required)

   - Go to http://localhost:3000/consultant/login
   - Login with your consultant credentials

3. **Connect Cal.com**:

   - Navigate to consultant dashboard
   - Click "Connect Cal.com" button
   - Authorize the app (create Cal.com account if needed)
   - You'll be redirected back with booking links displayed

4. **Test booking**:

   - Go to http://localhost:3000/consultations
   - Click on a consultant profile
   - Click "Book Now" on any service
   - Complete a test booking

5. **Verify webhook** (optional with ngrok):

   ```bash
   # Install ngrok
   npm install -g ngrok

   # Expose local server
   ngrok http 5001

   # Update webhook URL in Cal.com settings to:
   # https://your-ngrok-url.ngrok.io/api/calcom/webhook
   ```

---

## ✅ Success Checklist

- [ ] Cal.com OAuth app created
- [ ] Environment variables configured
- [ ] Servers running without errors
- [ ] Consultant can connect Cal.com
- [ ] Booking links displayed on dashboard
- [ ] "Book Now" buttons appear on public profile
- [ ] Test booking completes successfully
- [ ] Confirmation emails received

---

## 🎯 What's Next?

### For Consultants

1. Login to dashboard
2. Click "Connect Cal.com"
3. Set your availability in Cal.com
4. Share your profile link with clients
5. Receive bookings automatically

### For Clients

1. Browse consultants at `/consultations`
2. View consultant profiles
3. Click "Book Now" for any service
4. Complete booking on Cal.com
5. Receive confirmation email

---

## 🔧 Common First-Time Issues

### OAuth redirect fails

```
Error: redirect_uri_mismatch
```

**Fix**: Ensure `CALCOM_REDIRECT_URI` exactly matches Cal.com OAuth app settings

### Webhook signature invalid

```
Error: Invalid signature
```

**Fix**:

1. Generate new webhook secret: `openssl rand -hex 32`
2. Update `CALCOM_WEBHOOK_SECRET` in .env
3. Update webhook in Cal.com settings

### Booking links not showing

**Fix**:

1. Verify consultant is approved (`applicationStatus: 'approved'`)
2. Ensure at least one service is enabled
3. Check consultant connected Cal.com successfully

---

## 📞 Need Help?

- Read full documentation: `CALCOM_INTEGRATION.md`
- Cal.com docs: https://cal.com/docs
- Test webhook locally with ngrok: https://ngrok.com

---

## 🎉 You're All Set!

Your Cal.com integration is now ready. Consultants can connect their calendars and clients can book sessions seamlessly.
