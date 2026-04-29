
# Alemano Marker Scanner

This repository contains the Alemano Marker Scanner Android application (React Native). It detects, extracts, and saves visual markers from a live camera feed. The project includes the source, test images, and release APKs.

Contents
- `AlemanoMarkerScanner/` — full app source (TypeScript + native Android code).
- `apk/` — release APKs (stored via Git LFS for large files).
- `docs/` — design docs: `PRD.md`, `DETECTION_ENGINE.md`, `STACK.md`, `APPROACH.md`.

Quick start — install APK (recommended)

1. Enable USB debugging on a device or start an Android emulator.
2. Install the universal APK (replaces any existing install):

```bash
adb install -r apk/app-universal-release.apk
```

Notes:
- If `adb` reports a device not found, run `adb devices` and ensure the phone is authorized.
- Use the universal APK for most devices; if you need ABI-specific APKs, see `apk/` for `app-arm64-v8a` and `app-x86_64`.

Build from source (summary)

For full build instructions and prerequisites see `SETUP.md`. Minimal steps:

```bash
# From repo root
cd AlemanoMarkerScanner/android
# Clean then build a release APK (Windows example)
.\gradlew.bat clean assembleRelease --no-daemon
# Output: android/app/build/outputs/apk/release/
```

Important build notes
- Node: use Node >= 18 (see `package.json` engine). Install dependencies with `npm install`.
- Android: Android SDK, appropriate platform tools, and NDK are required for native frame-processor code.
- VisionCamera and native frame processors may require CMake/Ninja; avoid build paths with spaces on Windows if you encounter native build issues.

Git Large File Storage (LFS)
- Large APKs were migrated to Git LFS to satisfy GitHub limits. If you clone this repo, install Git LFS first:

```bash
# Install and enable Git LFS
git lfs install
git clone <repo-url>
git lfs pull
```

Cleaning up local crash logs
- The repo previously contained JVM/native crash logs like `hs_err_pid*.log` and `replay_pid*.log`. These are ignored via `.gitignore` now. You can remove local copies if they are not needed:

```powershell
del hs_err_pid*.log replay_pid*.log
```

Troubleshooting
- If release builds fail with Flipper/maven issues, ensure Flipper is debug-only in `android/app/build.gradle` or your environment can resolve Flipper artifacts.
- If you see CMake/Ninja manifest loops on Windows, try building in a short no-space path (e.g., `C:\AlemonoBuild`) and copy artifacts back.

Contributing
- If you want me to prepare a trimmed APK (smaller size) or upload the APK to an external file host, tell me and I will do it.

Contact
- Author: Alemano Engineering Team

Last updated: April 29, 2026

