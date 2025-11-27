# Step-by-Step Guide: Fix "Invalid redirect custom scheme" Error

## 🎯 Goal
Configure LINE Developers Console to allow `natively://line-callback` as a valid redirect URI for your iOS/Android app.

---

## 📋 Before You Start

- [ ] Open LINE Developers Console: https://developers.line.biz/console/
- [ ] Log in with your LINE Business account
- [ ] Have these values ready:
  - Channel ID: `2008377867`
  - iOS Bundle ID: `com.dataslot.hr`
  - Android Package: `com.dataslot.hr`
  - Callback URL: `natively://line-callback`

---

## 🔧 Step-by-Step Instructions

### Step 1: Navigate to Your Channel
1. Go to https://developers.line.biz/console/
2. Click on your **Provider**
3. Click on **Channels**
4. Select your channel with ID: **2008377867**

### Step 2: Go to LINE Login Settings
1. In the channel page, click the **"LINE Login"** tab
2. You should see the LINE Login configuration page

### Step 3: Configure Callback URL (Top Section)
1. Look for the **"Callback URL"** section (usually near the top)
2. Click **"Edit"** or **"+ Add"** button
3. In the text field, enter: `natively://line-callback`
4. Click **"Add"** or **"Save"**
5. You should now see `natively://line-callback` in the list

**✓ Checkpoint**: You should see `natively://line-callback` listed under Callback URL

### Step 4: Configure App Settings (Bottom Section)
1. Scroll down to find **"App settings"** section
2. Fill in the following fields:

   **For iOS:**
   - **iOS URL scheme**: Enter `natively` (just the word, no `://`)
   - **iOS Bundle ID**: Enter `com.dataslot.hr`
   - **iOS Universal Link**: Leave empty (optional)

   **For Android:**
   - **Android URL scheme**: Enter `natively` (just the word, no `://`)
   - **Android Package name**: Enter `com.dataslot.hr`
   - **Android App Link**: Leave empty (optional)

**✓ Checkpoint**: All fields should be filled correctly

### Step 5: Save Changes
1. Scroll to the bottom of the page
2. Click the **"Update"** button
3. Wait for the success message

### Step 6: Wait for Propagation
1. **Important**: Wait 5-10 minutes for changes to take effect
2. LINE needs time to propagate the configuration across their servers
3. Don't test immediately after saving

### Step 7: Test on TestFlight
1. Open your app from TestFlight
2. Tap "Sign in with LINE"
3. Complete the LINE login process
4. You should be redirected back to the app successfully

---

## ✅ Verification Checklist

After completing all steps, verify:

- [ ] Callback URL section shows: `natively://line-callback`
- [ ] iOS URL scheme shows: `natively`
- [ ] Android URL scheme shows: `natively`
- [ ] iOS Bundle ID shows: `com.dataslot.hr`
- [ ] Android Package name shows: `com.dataslot.hr`
- [ ] Clicked "Update" button
- [ ] Waited 5-10 minutes
- [ ] Tested on TestFlight

---

## 📸 What You Should See

### Callback URL Section (Top)
```
┌────────────────────────────────────────────┐
│ Callback URL                                │
│                                             │
│ natively://line-callback              [×]   │ ← Should see this
│                                             │
│ [+ Add]                                     │
└────────────────────────────────────────────┘
```

### App Settings Section (Bottom)
```
┌────────────────────────────────────────────┐
│ App settings                                │
│                                             │
│ iOS URL scheme                              │
│ ┌────────────────────────────────────────┐ │
│ │ natively                                │ │ ← Should see this
│ └────────────────────────────────────────┘ │
│                                             │
│ iOS Bundle ID                               │
│ ┌────────────────────────────────────────┐ │
│ │ com.dataslot.hr                         │ │ ← Should see this
│ └────────────────────────────────────────┘ │
│                                             │
│ Android URL scheme                          │
│ ┌────────────────────────────────────────┐ │
│ │ natively                                │ │ ← Should see this
│ └────────────────────────────────────────┘ │
│                                             │
│ Android Package name                        │
│ ┌────────────────────────────────────────┐ │
│ │ com.dataslot.hr                         │ │ ← Should see this
│ └────────────────────────────────────────┘ │
└────────────────────────────────────────────┘
```

---

## ❌ Common Mistakes to Avoid

### Mistake 1: Wrong URL Scheme Format
```
❌ WRONG:
iOS URL scheme: natively://line-callback

✓ CORRECT:
iOS URL scheme: natively
```

### Mistake 2: Forgetting Callback URL
```
❌ WRONG:
Callback URL: (empty)

✓ CORRECT:
Callback URL: natively://line-callback
```

### Mistake 3: Testing Too Soon
```
❌ WRONG:
Save → Test immediately

✓ CORRECT:
Save → Wait 5-10 minutes → Test
```

### Mistake 4: Wrong Bundle ID
```
❌ WRONG:
iOS Bundle ID: com.example.app

✓ CORRECT:
iOS Bundle ID: com.dataslot.hr
```

---

## 🐛 Troubleshooting

### Error: "Invalid redirect custom scheme"
**Cause**: Callback URL not registered  
**Fix**: Make sure you added `natively://line-callback` in the Callback URL section

### Error: "redirect_uri_mismatch"
**Cause**: Callback URL doesn't match  
**Fix**: Check that you entered `natively://line-callback` exactly (no typos)

### Error: Still not working after configuration
**Possible causes**:
1. Didn't wait long enough (wait 10-15 minutes)
2. Typo in the callback URL
3. Wrong Bundle ID or Package name
4. Didn't click "Update" button

**Debug steps**:
1. Double-check all fields in LINE Developers Console
2. Wait 15 minutes
3. Restart your iPhone
4. Reinstall the app from TestFlight
5. Check Xcode console logs for error messages

### How to check console logs:
1. Connect iPhone to Mac
2. Open Xcode
3. Go to Window → Devices and Simulators
4. Select your device
5. Click "Open Console"
6. Run the app and look for LINE-related errors

---

## 📞 Need Help?

### Check These Files:
- `QUICK_FIX.md` - Quick reference guide
- `LINE_CONFIG_SUMMARY.txt` - Visual summary
- `LINE_CONSOLE_CONFIG.md` - Detailed configuration guide
- `README.md` - Full documentation

### Still Stuck?
1. Take screenshots of your LINE Developers Console settings
2. Copy the exact error message
3. Check Xcode console logs
4. Contact LINE Developer Support: https://developers.line.biz/en/support/

---

## 🎉 Success!

If everything is configured correctly:
1. User taps "Sign in with LINE"
2. LINE login page opens
3. User logs in and approves
4. App opens automatically
5. User is logged in successfully

---

## 📝 Summary

**Two sections to configure:**

1. **Callback URL** (top section)
   - Add: `natively://line-callback`

2. **App settings** (bottom section)
   - iOS URL scheme: `natively`
   - Android URL scheme: `natively`
   - iOS Bundle ID: `com.dataslot.hr`
   - Android Package: `com.dataslot.hr`

**Remember:**
- ✓ Configure BOTH sections
- ✓ Use just `natively` in App settings
- ✓ Use full URL `natively://line-callback` in Callback URL
- ✓ Wait 5-10 minutes after saving
- ✓ Test on TestFlight

---

**Created**: November 17, 2025  
**Channel ID**: 2008377867  
**App**: TimeWise HR App

