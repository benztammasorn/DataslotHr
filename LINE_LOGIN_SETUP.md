With Expo
Install the JavaScript side with:

npx expo install @xmartlabs/react-native-line
Add the plugins expo-build-properties and @xmartlabs/react-native-line to your app.json:

"plugins": [
  [
    "expo-build-properties",
    {
      "ios": {
        "useFrameworks": "static"
      }
    }
  ],
  "@xmartlabs/react-native-line"
]
With react-native-cli
Install library:

npm install @xmartlabs/react-native-line

# --- or ---

yarn add @xmartlabs/react-native-line
Link iOS native code:

cd ios && pod install
Change your AppDelegate to match the following:

With Objective-C
@xmartlabs/react-native-line v4
#import "RNLine-Swift.h"

...

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [LineLogin application:application open:url options:options];
}
@xmartlabs/react-native-line v5
#import "react_native_line-Swift.h"

...

- (BOOL)application:(UIApplication *)application openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options
{
  return [LineLogin application:application open:url options:options];
}
With Swift
@xmartlabs/react-native-line v4
import RNLine

...

override func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
  return LineLogin.application(application, open: url, options: options)
}
@xmartlabs/react-native-line v5
import react_native_line

...

override func application(_ application: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey : Any] = [:]) -> Bool {
  return LineLogin.application(application, open: url, options: options)
}
Insert the following snippet in your Info.plist just before the last </dict> tag:

<key>CFBundleURLTypes</key>
<array>
    <dict>
        <key>CFBundleTypeRole</key>
        <string>Editor</string>
        <key>CFBundleURLSchemes</key>
        <array>
            <string>line3rdp.$(PRODUCT_BUNDLE_IDENTIFIER)</string>
        </array>
    </dict>
</array>
<key>LSApplicationQueriesSchemes</key>
<array>
    <string>lineauth2</string>
</array>
Migration guide
You can find the migration guide in the linked document.

Usage
Import the Line module:

import Line from '@xmartlabs/react-native-line'
Initialize the module with the setup method:

useEffect(() => {
  Line.setup({ channelId: 'YOUR_CHANNEL_ID' })
}, [])
Log in with the login method:

Line.login({})
API
Method	Description
login(params: LoginParams): Promise<LoginResult>	Starts the login flow of Line's SDK (Opens the apps if it's installed and defaults to the browser otherwise). It accepts the same argumements as the LineSDK, in an object { key: value }, defaults the same way as LineSDK too.
getCurrentAccessToken(): Promise<AccessToken>	Returns the access token of the current user.
getProfile(): Promise<UserProfile>	Returns the current user profile information.
logout(): Promise<void>	Revokes the access token of the current user.
refreshAccessToken(): Promise<AccessToken>	Refreshes the access token of the current user.
setup(params: SetupParams): Promise<void>	Initializes the Line SDK.
verifyAccessToken(): Promise<VerifyResult>	Checks whether the access token of the current user is valid.
getFriendshipStatus(): Promise<FriendshipStatus>	Gets the friendship status between the LINE Official Account (which is linked to the current channel) and the user if configured.