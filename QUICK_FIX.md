# QUICK FIX: "Invalid redirect custom scheme" Error

## The Problem
You're getting **"Invalid redirect custom scheme"** error because LINE requires you to register the **full callback URL** in the Callback URL section.

---

## The Solution (2 Steps)

### Step 1: Configure URL Scheme (App Settings)
Go to: **LINE Developers Console** → **LINE Login** → **App settings**

```
iOS URL scheme:     natively
Android URL scheme: natively
iOS Bundle ID:      com.dataslot.hr
Android Package:    com.dataslot.hr
```

⚠️ **Important**: Enter ONLY `natively` (not `natively://line-callback`)

---

### Step 2: Add Callback URL (Callback URL Section)
Go to: **LINE Developers Console** → **LINE Login** → **Callback URL**

Click **"Edit"** or **"Add"**, then add:

```
natively://line-callback
```

⚠️ **Important**: Enter the FULL URL including `://line-callback`

---

## Visual Guide

```
┌─────────────────────────────────────────────────────────┐
│ LINE Developers Console                                  │
│ https://developers.line.biz/console/                     │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ Select Channel: 2008377867                               │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ Click: LINE Login Tab                                    │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ SECTION 1: App settings                                  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ iOS URL scheme:     [natively]                       │ │
│ │ Android URL scheme: [natively]                       │ │
│ │ iOS Bundle ID:      [com.dataslot.hr]               │ │
│ │ Android Package:    [com.dataslot.hr]               │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ SECTION 2: Callback URL                                  │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [natively://line-callback]                 [Add]    │ │
│ └─────────────────────────────────────────────────────┘ │
│                                                          │
│ ⚠️  YOU MUST ADD THE FULL URL HERE!                     │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ Click: Update                                            │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ Wait 5-10 minutes                                        │
└─────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────┐
│ Test on TestFlight                                       │
└─────────────────────────────────────────────────────────┘
```

---

## Why Both Are Needed?

### URL Scheme (in App Settings)
- Tells LINE what scheme your app uses
- LINE uses this to validate the callback URL
- Enter: `natively` (just the scheme name)

### Callback URL (in Callback URL section)
- Tells LINE the exact URL to redirect to
- Must match exactly what your app sends
- Enter: `natively://line-callback` (full URL)

---

## Common Mistakes

### ❌ WRONG
```
App settings:
  iOS URL scheme: natively://line-callback  ← WRONG!

Callback URL:
  (empty)  ← WRONG!
```

### ✅ CORRECT
```
App settings:
  iOS URL scheme: natively  ← CORRECT!

Callback URL:
  natively://line-callback  ← CORRECT!
```

---

## Screenshot Reference

When you open LINE Developers Console, look for these sections:

```
┌────────────────────────────────────────────┐
│ LINE Login Settings                         │
├────────────────────────────────────────────┤
│                                             │
│ Channel ID: 2008377867                      │
│ Channel secret: ****                        │
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ Callback URL                             ││
│ │ ┌─────────────────────────────────────┐ ││
│ │ │ natively://line-callback      [×]   │ ││ ← Add here!
│ │ └─────────────────────────────────────┘ ││
│ │ [+ Add]                                  ││
│ └─────────────────────────────────────────┘│
│                                             │
│ ┌─────────────────────────────────────────┐│
│ │ App settings                             ││
│ │                                          ││
│ │ iOS URL scheme                           ││
│ │ ┌──────────────────────────────────────┐││
│ │ │ natively                              │││ ← Add here!
│ │ └──────────────────────────────────────┘││
│ │                                          ││
│ │ iOS Bundle ID                            ││
│ │ ┌──────────────────────────────────────┐││
│ │ │ com.dataslot.hr                       │││
│ │ └──────────────────────────────────────┘││
│ │                                          ││
│ │ Android URL scheme                       ││
│ │ ┌──────────────────────────────────────┐││
│ │ │ natively                              │││
│ │ └──────────────────────────────────────┘││
│ │                                          ││
│ │ Android Package name                     ││
│ │ ┌──────────────────────────────────────┐││
│ │ │ com.dataslot.hr                       │││
│ │ └──────────────────────────────────────┘││
│ └─────────────────────────────────────────┘│
│                                             │
│ [Update]                                    │
└────────────────────────────────────────────┘
```

---

## Checklist

Before testing on TestFlight:

- [ ] LINE Developers Console → LINE Login → App settings
  - [ ] iOS URL scheme = `natively`
  - [ ] Android URL scheme = `natively`
  - [ ] iOS Bundle ID = `com.dataslot.hr`
  - [ ] Android Package = `com.dataslot.hr`

- [ ] LINE Developers Console → LINE Login → Callback URL
  - [ ] Added: `natively://line-callback`

- [ ] Clicked "Update" button

- [ ] Waited 5-10 minutes

- [ ] Ready to test on TestFlight!

---

## Still Not Working?

### Check the exact error message:
- **"Invalid redirect custom scheme"** → Callback URL not registered
- **"redirect_uri_mismatch"** → Callback URL doesn't match
- **"Indirect URL"** → URL scheme not configured

### Verify your settings:
1. Go to LINE Developers Console
2. Check both sections (App settings AND Callback URL)
3. Make sure both are filled correctly
4. Click Update
5. Wait 10-15 minutes
6. Clear app cache and reinstall from TestFlight

### Debug steps:
1. Check Xcode console logs
2. Look for: "Redirect URI: natively://line-callback"
3. Look for: "Auth URL: https://access.line.me/oauth2/v2.1/authorize?..."
4. Verify the redirect_uri parameter in the Auth URL

---

## Contact Support

If still not working after following all steps:
1. Take screenshots of your LINE Developers Console settings
2. Copy the exact error message
3. Check Xcode console logs
4. Contact LINE Developer Support: https://developers.line.biz/en/support/

---

**Last Updated**: November 17, 2025

