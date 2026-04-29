Setup and build (React Native - AlemanoMarkerScanner)

Prerequisites
- Node.js 18+ (or as specified in package.json `engines`).
- Java JDK 17.
- Android SDK (platforms and build-tools) and `platform-tools` on PATH.
- Android Studio recommended to install SDK components.
- Xcode & CocoaPods (macOS only, for iOS builds).

Quick setup (Android, Windows)
1. Clone the repo:

   git clone <your-repo-url>
   cd AlemanoMarkerScanner

2. Install JS dependencies:

   npm install

3. (Optional) If you will build iOS (macOS only):

   cd ios
   pod install
   cd ..

4. Build a debug APK and run on connected device:

   npx react-native run-android

5. Build a release APK (standalone installable):

   cd android
   gradlew.bat assembleRelease

   The generated APKs are in:
   android\app\build\outputs\apk\release\
   Use `app-universal-release.apk` for installing on most devices.

Notes on signing and Play Store:
- This project currently uses the debug keystore for convenience. For Play Store or production, generate a release keystore and update `android/app/build.gradle` signingConfigs (see https://reactnative.dev/docs/signed-apk-android).
- Do NOT commit any keystore or `local.properties` (it contains SDK paths).

Cleaning and preparing the repo for public upload
- This repository includes a `.gitignore` to exclude `node_modules`, build artifacts, local keystores and temporary build copies.
- To prepare for a public repo:
  - Ensure `local.properties` is not committed (remove if present in the working tree: `git rm --cached android/local.properties`).
  - Keep `package-lock.json` or `yarn.lock` (recommended) to lock dependencies.

Troubleshooting
- If native builds fail on Windows due to path/CMake issues, avoid spaces in the project path or build on a path without spaces (e.g., create a temporary copy at `C:\AlemonoBuild`), then run the Gradle task there.
- If Gradle fails to download dependencies, ensure internet access and repo URLs (Maven Central) are reachable.

If you want, I can:
- Create a minimal CONTRIBUTING.md and CODE_OF_CONDUCT.
- Prepare a single-folder repo (move `AlemanoMarkerScanner` contents to repository root) before you push.
