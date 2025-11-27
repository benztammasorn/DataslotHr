# LINE Developers Console Configuration Guide

## Visual Guide: Where to Enter What

```
┌─────────────────────────────────────────────────────────────┐
│ LINE Developers Console                                      │
│ https://developers.line.biz/                                 │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Select Your Channel                                          │
│ Channel ID: 2008377867                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Click "LINE Login" Tab                                       │
└─────────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────────┐
│ Scroll to "App settings" Section                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Section 1: App Settings (For Mobile Apps)

### iOS Configuration
```
┌──────────────────────────────────────────────────────┐
│ iOS URL scheme                                        │
│ ┌──────────────────────────────────────────────────┐ │
│ │ natively                                          │ │
│ └──────────────────────────────────────────────────┘ │
│                                                       │
│ ⚠️  Enter ONLY: natively                             │
│ ❌  Do NOT enter: natively://                        │
│ ❌  Do NOT enter: natively://line-callback           │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ iOS Bundle ID                                         │
│ ┌──────────────────────────────────────────────────┐ │
│ │ com.dataslot.hr                                   │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ iOS Universal Link (Optional)                         │
│ ┌──────────────────────────────────────────────────┐ │
│ │ https://hr.dataslot.app                           │ │
│ └──────────────────────────────────────────────────┘ │
│                                                       │
│ ℹ️  Leave empty for now, or add your domain          │
└──────────────────────────────────────────────────────┘
```

### Android Configuration
```
┌──────────────────────────────────────────────────────┐
│ Android URL scheme                                    │
│ ┌──────────────────────────────────────────────────┐ │
│ │ natively                                          │ │
│ └──────────────────────────────────────────────────┘ │
│                                                       │
│ ⚠️  Enter ONLY: natively                             │
│ ❌  Do NOT enter: natively://                        │
│ ❌  Do NOT enter: natively://line-callback           │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Android Package name                                  │
│ ┌──────────────────────────────────────────────────┐ │
│ │ com.dataslot.hr                                   │ │
│ └──────────────────────────────────────────────────┘ │
└──────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────┐
│ Android App Link (Optional)                           │
│ ┌──────────────────────────────────────────────────┐ │
│ │ https://hr.dataslot.app                           │ │
│ └──────────────────────────────────────────────────┘ │
│                                                       │
│ ℹ️  Leave empty for now, or add your domain          │
└──────────────────────────────────────────────────────┘
```

---

## Section 2: Callback URL (REQUIRED!)

```
┌──────────────────────────────────────────────────────┐
│ Callback URL                                          │
│ ┌──────────────────────────────────────────────────┐ │
│ │ natively://line-callback                          │ │
│ └──────────────────────────────────────────────────┘ │
│                                                       │
│ ⚠️  YOU MUST ADD THIS FOR MOBILE APPS!               │
│ ⚠️  Add the FULL callback URL here                   │
│                                                       │
│ For mobile apps:                                      │
│ • natively://line-callback                           │
│                                                       │
│ For web apps (you can add multiple):                 │
│ • https://hr.dataslot.app/line-callback              │
│ • https://auth.expo.io/@username/app-name            │
│                                                       │
│ ❌ https://localhost:8081/line-callback (won't work) │
└──────────────────────────────────────────────────────┘
```

---

## What Happens Behind the Scenes

### When User Clicks "Sign in with LINE"

```
Step 1: App constructs authorization URL
┌─────────────────────────────────────────────────────┐
│ https://access.line.me/oauth2/v2.1/authorize        │
│   ?response_type=code                               │
│   &client_id=2008377867                             │
│   &redirect_uri=natively://line-callback            │
│   &state=abc123xyz                                  │
│   &scope=profile openid                             │
└─────────────────────────────────────────────────────┘
                    ↓
Step 2: Opens LINE login page (Safari or LINE app)
┌─────────────────────────────────────────────────────┐
│ LINE Login Page                                     │
│ • User enters credentials                           │
│ • User approves permissions                         │
└─────────────────────────────────────────────────────┘
                    ↓
Step 3: LINE redirects back to app
┌─────────────────────────────────────────────────────┐
│ natively://line-callback                            │
│   ?code=AUTHORIZATION_CODE                          │
│   &state=abc123xyz                                  │
└─────────────────────────────────────────────────────┘
                    ↓
Step 4: App intercepts the URL
┌─────────────────────────────────────────────────────┐
│ iOS: App opens via URL scheme                       │
│ App.json: "scheme": "natively"                      │
│ App.json: "deepLinks": ["natively://line-callback"] │
└─────────────────────────────────────────────────────┘
                    ↓
Step 5: App exchanges code for token
┌─────────────────────────────────────────────────────┐
│ POST https://api.line.me/oauth2/v2.1/token          │
│ Body:                                               │
│   grant_type=authorization_code                     │
│   code=AUTHORIZATION_CODE                           │
│   redirect_uri=natively://line-callback             │
│   client_id=2008377867                              │
│   client_secret=***                                 │
└─────────────────────────────────────────────────────┘
                    ↓
Step 6: Receive access token
┌─────────────────────────────────────────────────────┐
│ {                                                   │
│   "access_token": "eyJhbGc...",                     │
│   "token_type": "Bearer",                           │
│   "expires_in": 2592000,                            │
│   "id_token": "eyJhbGc..."                          │
│ }                                                   │
└─────────────────────────────────────────────────────┘
                    ↓
Step 7: Get user profile
┌─────────────────────────────────────────────────────┐
│ GET https://api.line.me/v2/profile                  │
│ Authorization: Bearer eyJhbGc...                    │
└─────────────────────────────────────────────────────┘
                    ↓
Step 8: User logged in!
┌─────────────────────────────────────────────────────┐
│ {                                                   │
│   "userId": "U25fdbff...",                          │
│   "displayName": "John Doe",                        │
│   "pictureUrl": "https://...",                      │
│   "statusMessage": "Hello"                          │
│ }                                                   │
└─────────────────────────────────────────────────────┘
```

---

## Common Errors and Solutions

### Error: "Indirect URL"

```
❌ Problem:
LINE Developers Console → iOS URL scheme = "natively://line-callback"

✅ Solution:
LINE Developers Console → iOS URL scheme = "natively"
```

**Why?**
- LINE automatically constructs the full URL
- If you enter `natively://line-callback`, LINE creates:
  `natively://line-callback://line-callback?code=xxx`
- This is an invalid URL format

---

### Error: "redirect_uri_mismatch"

```
❌ Problem:
App sends: natively://line-callback
LINE expects: https://your-domain.com/callback

✅ Solution:
Make sure you're configuring the URL scheme in "App settings"
NOT in "Callback URL" section
```

---

### Error: "App doesn't open after LINE login"

```
❌ Problem:
app.json doesn't have the correct scheme

✅ Solution:
Check app.json:
{
  "expo": {
    "scheme": "natively",
    "deepLinks": ["natively://line-callback"]
  }
}
```

---

## Testing Checklist

### Before Building for TestFlight:
- [ ] LINE Developers Console configured
- [ ] iOS URL scheme = `natively`
- [ ] iOS Bundle ID = `com.dataslot.hr`
- [ ] app.json has correct scheme
- [ ] services/lineAuth.ts uses fixed redirect URI

### After Uploading to TestFlight:
- [ ] Wait 5-10 minutes for LINE changes to propagate
- [ ] Install app from TestFlight
- [ ] Test LINE login
- [ ] Check console logs
- [ ] Verify user profile is fetched

### If Still Not Working:
1. Double-check LINE Developers Console
2. Wait 15-30 minutes
3. Restart iPhone
4. Reinstall from TestFlight
5. Check Xcode logs
6. Contact LINE support if needed

---

## Screenshot Locations (Reference)

When you open LINE Developers Console, you'll see:

```
Top Navigation:
[Providers] → [Select Provider] → [Channels] → [Your Channel]

Left Sidebar:
• Basic settings
• Messaging API
• LINE Login  ← Click here
• LINE Notify
• ...

LINE Login Page:
• Channel ID
• Channel secret
• Callback URL  ← For web apps only
• App settings  ← For mobile apps (iOS/Android)
  - iOS URL scheme  ← Enter "natively"
  - iOS Bundle ID
  - iOS Universal Link
  - Android URL scheme  ← Enter "natively"
  - Android Package name
  - Android App Link
```

---

## Quick Reference

| Setting | Value | Location |
|---------|-------|----------|
| iOS URL scheme | `natively` | LINE Login → App settings |
| Android URL scheme | `natively` | LINE Login → App settings |
| iOS Bundle ID | `com.dataslot.hr` | LINE Login → App settings |
| Android Package | `com.dataslot.hr` | LINE Login → App settings |
| Callback URL | `https://...` | LINE Login → Callback URL (web only) |
| Channel ID | `2008377867` | LINE Login → Basic settings |

---

**Important**: After making changes in LINE Developers Console, wait 5-10 minutes before testing!


