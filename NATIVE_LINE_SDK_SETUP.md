# Native LINE SDK Setup Guide

## Overview

This guide will help you set up `@xmartlabs/react-native-line` for native LINE Login integration.

## Current Status

✅ **Completed:**
- Installed `@xmartlabs/react-native-line` package
- Updated `app.json` with required plugins
- Created `lineAuthNative.ts` with native SDK implementation
- Generated iOS/Android native folders with `expo prebuild`

⚠️ **Issue:**
- CocoaPods installation failing due to visionOS compatibility with CocoaPods 1.12.1
- Need CocoaPods 1.13+ or workaround for visionOS references

---

## Prerequisites

Before continuing, you need to have:

1. **Xcode** installed (not just Command Line Tools)
2. **CocoaPods** 1.13+ (recommended)
3. **macOS** for iOS development

---

## Step 1: Fix CocoaPods Installation

### Option A: Update CocoaPods (Recommended)

```bash
sudo gem install cocoapods
```

After updating, verify version:
```bash
pod --version  # Should be 1.13.0 or higher
```

### Option B: Use Workaround Script (If can't update CocoaPods)

I've already patched the problematic files. Just run:

```bash
cd /Users/tammasorn/Desktop/Project/hr-app/ios
pod install
```

If it still fails, run this script:

```bash
cd /Users/tammasorn/Desktop/Project/hr-app
./scripts/fix-visionos.sh
```

---

## Step 2: Set Xcode Developer Path

```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

Verify:
```bash
xcode-select -p
# Should output: /Applications/Xcode.app/Contents/Developer
```

---

## Step 3: Install iOS Dependencies

```bash
cd /Users/tammasorn/Desktop/Project/hr-app/ios
pod install
```

This should install all CocoaPods dependencies including the LINE SDK.

---

## Step 4: Update App Code to Use Native SDK

### Update `app/_layout.tsx`

Add LINE SDK initialization:

```typescript
import { useEffect } from 'react';
import { initializeLineSDK } from '../services/lineAuthNative';

export default function RootLayout() {
  useEffect(() => {
    // Initialize LINE SDK
    initializeLineSDK();
  }, []);
  
  // ... rest of layout code
}
```

### Update `app/login.tsx`

Replace the import at the top:

```typescript
// OLD:
// import { handleLineLogin } from '../services/lineAuth';

// NEW:
import { handleLineLogin } from '../services/lineAuthNative';
```

The rest of the login code remains the same!

---

## Step 5: Update LINE Developers Console

The native SDK uses a different URL scheme format:

### LINE Developers Console Configuration:

1. Go to https://developers.line.biz/console/
2. Select Channel ID: **2008377867**
3. Go to **LINE Login** tab

4. **App settings** section:
   - **iOS URL scheme**: `line3rdp.com.dataslot.hr`
   - **Android URL scheme**: Leave empty (will use package name)
   - **iOS Bundle ID**: `com.dataslot.hr`
   - **Android Package name**: `com.dataslot.hr`

5. **Callback URL** section:
   - Can leave empty for native SDK (not needed)

### Important Notes:

- Native SDK uses format: `line3rdp.{BUNDLE_IDENTIFIER}`
- For `com.dataslot.hr`, it becomes: `line3rdp.com.dataslot.hr`
- The `@xmartlabs/react-native-line` plugin automatically configures this
- No need to manually add to Info.plist (plugin handles it)

---

## Step 6: Build and Test

### For iOS Simulator:

```bash
cd /Users/tammasorn/Desktop/Project/hr-app
npx expo run:ios
```

### For TestFlight/Production:

```bash
# Using EAS Build
eas build --platform ios

# Or local build
cd ios
xcodebuild -workspace timewisehrappycbbdk.xcworkspace -scheme timewisehrappycbbdk archive
```

---

## File Structure

After setup, your project should have:

```
hr-app/
├── services/
│   ├── lineAuth.ts          # Old web-based method (backup)
│   └── lineAuthNative.ts    # New native SDK method ✨
├── app/
│   ├── _layout.tsx          # Initialize LINE SDK here
│   └── login.tsx            # Use handleLineLogin from lineAuthNative
├── ios/                     # Native iOS project (generated)
├── android/                 # Native Android project (generated)
└── app.json                 # Updated with plugins
```

---

## Differences: Native SDK vs Web-based

| Feature | Web-based (expo-web-browser) | Native SDK (@xmartlabs) |
|---------|------------------------------|-------------------------|
| Setup | Simple | Complex (prebuild required) |
| URL Scheme | `natively://line-callback` | `line3rdp.{BUNDLE_ID}` |
| LINE App Integration | Opens in browser/modal | Native LINE app integration |
| Expo Go | ✅ Works | ❌ Doesn't work (needs build) |
| Build Required | No | Yes (custom build) |
| User Experience | Good | Better (seamless) |

---

## Troubleshooting

### Error: "pod install" fails

**Solution 1:** Update CocoaPods
```bash
sudo gem install cocoapods
pod --version  # Verify 1.13.0+
```

**Solution 2:** Check Xcode path
```bash
xcode-select -p
# Should be: /Applications/Xcode.app/Contents/Developer
# If not:
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

**Solution 3:** Clean and retry
```bash
cd ios
rm -rf Pods Podfile.lock
pod install
```

### Error: "Unexpected XCode version string ''"

**Cause:** Xcode Command Line Tools are being used instead of full Xcode

**Solution:**
```bash
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer
```

### Error: "visionos deployment target"

**Cause:** CocoaPods < 1.13 doesn't support visionOS

**Solution:** I've already patched the files. If issues persist:
```bash
cd /Users/tammasorn/Desktop/Project/hr-app
find node_modules -name "*.podspec" -type f -exec sed -i '' 's/s\.visionos/# s.visionos/g' {} \;
cd ios
pod install
```

### Error: Module not found: '@xmartlabs/react-native-line'

**Cause:** Library not properly linked after prebuild

**Solution:**
```bash
cd ios
pod install
cd ..
npx expo run:ios
```

---

## Testing Checklist

After setup:

- [ ] CocoaPods installed successfully
- [ ] `ios/Pods` directory exists
- [ ] LINE SDK pod installed (check Podfile.lock for "react-native-line")
- [ ] App builds without errors
- [ ] LINE Login opens LINE app (if installed) or browser
- [ ] After login, redirects back to app
- [ ] User profile fetched successfully

---

## Quick Commands Reference

```bash
# 1. Fix Xcode path
sudo xcode-select --switch /Applications/Xcode.app/Contents/Developer

# 2. Install pods
cd /Users/tammasorn/Desktop/Project/hr-app/ios
pod install

# 3. Run on iOS
cd ..
npx expo run:ios

# 4. Build for TestFlight
eas build --platform ios
```

---

## Next Steps

1. ✅ Complete CocoaPods installation
2. ✅ Update app code to use lineAuthNative
3. ✅ Update LINE Developers Console with `line3rdp.com.dataslot.hr`
4. ✅ Build and test on device/simulator
5. ✅ Upload to TestFlight

---

## Need Help?

### If CocoaPods Issues Persist:

Consider reverting to the web-based approach:
1. Remove `@xmartlabs/react-native-line` from plugins in app.json
2. Delete `ios/` and `android/` folders
3. Use `services/lineAuth.ts` (original implementation)
4. Follow the simpler setup in `QUICK_FIX.md`

The web-based approach is simpler and works well for most use cases!

---

**Created**: November 17, 2025  
**Channel ID**: 2008377867  
**Bundle ID**: com.dataslot.hr

