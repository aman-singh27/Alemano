# CODEX MASTER PROMPT
## Alemeno Marker Scanner — React Native Android App

---

You are building a complete React Native Android application called **Alemeno Marker Scanner**. This is a custom visual marker detection app — similar to a QR code scanner — built for the Alemeno internship assignment.

Before writing a single line of code, **read all three reference documents in this directory**:

1. `PRD.md` — Full product requirements, all 11 screens with exact specifications, navigation architecture, state model, animation specs, and design tokens.
2. `DETECTION_ENGINE.md` — Complete technical spec for the OpenCV-based marker detection pipeline. Every step of the algorithm is documented. Follow it exactly.
3. `STACK.md` — Full tech stack, exact package versions, project file structure, theme tokens, navigation types, data model, and build configuration.

These documents are your **single source of truth**. Do not deviate from them. Do not introduce libraries not listed in `STACK.md`. Do not change the detection algorithm from what is described in `DETECTION_ENGINE.md`. Do not change any screen layout from what is described in `PRD.md`.

---

## What You Are Building

A React Native Android app that:
1. Shows a live camera feed at 2000–3000px resolution using `react-native-vision-camera`
2. Detects a custom square marker (black border + corner anchor square) in real time using **native Kotlin + OpenCV**
3. Extracts, perspective-corrects, and orientation-corrects each detected marker
4. Collects exactly 20 captures from 20 different frames
5. Displays all 20 markers in a 4-column grid at exactly 300×300px each

---

## Design System (Non-Negotiable)

The app follows the design shown in the reference image `DESIGN_REFERENCE.png` (attached separately). Follow the design exactly:

- **Background:** `#F7F7F7`
- **Accent:** `#FF4D4D` (used ONLY for CTAs, highlights, active states — never decoratively)
- **Text:** `#111111` primary, `#666666` secondary
- **Border:** `#E5E5E5`
- **Typography:** System sans-serif (Inter/Roboto), weights: 700/600/400
- **Spacing:** 8pt grid, 20px screen padding, 16px card padding
- **Cards:** 12–16px border radius, thin 1px border, minimal/no shadow
- **Buttons:** 50px border radius (pill shape), full-width for primary CTAs

Do NOT use gradients, heavy shadows, or decorative colors. The red accent is functional only.

---

## Build Order

Build in this exact sequence. Complete each phase fully before starting the next.

### Phase 1 — Project Foundation
1. Initialize React Native 0.73 project: `AlemanoMarkerScanner`
2. Install ALL dependencies from `STACK.md` section 7
3. Configure `android/app/build.gradle` as specified in `STACK.md` section 6
4. Add OpenCV 4.8.0 dependency
5. Set up AndroidManifest.xml with all permissions from `DETECTION_ENGINE.md` section 10
6. Create the full directory structure from `STACK.md` section 2
7. Create all theme files: `src/theme/colors.ts`, `typography.ts`, `spacing.ts`, `index.ts` — use exact values from `STACK.md` section 3
8. Create navigation types: `src/navigation/types.ts` — use exact types from `STACK.md` section 4
9. Create data types: `src/types/index.ts` — use exact model from `STACK.md` section 5
10. Create both Zustand stores: `src/store/useMarkerStore.ts` and `src/store/useSettingsStore.ts`

### Phase 2 — Native Detection Module
11. Create `android/app/src/main/java/com/alemenomarkerscanner/MarkerDetector.kt`
    - Implement the full 5-step pipeline from `DETECTION_ENGINE.md`
    - All 4 fingerprint checks (CHECK A, B, C, D)
    - Orientation correction logic
    - Returns: detected boolean, corners array, orientation degrees
12. Create `android/app/src/main/java/com/alemenomarkerscanner/FrameProcessorPlugin.kt`
    - VisionCamera v4 frame processor plugin
    - Calls `MarkerDetector.detect()` on each frame
    - Returns detection result to JS worklet
13. Create `android/app/src/main/java/com/alemenomarkerscanner/MarkerDetectorModule.kt`
    - Exposes `extractMarker(frameUri, corners)` method to React Native
    - Runs extraction pipeline, saves 300×300 JPEG to app cache
    - Returns file URI + metadata
14. Create `android/app/src/main/java/com/alemenomarkerscanner/MarkerDetectorPackage.kt`
    - Registers both the module and frame processor plugin
15. Register package in `MainApplication.kt`
16. Create JS interface: `src/native/MarkerDetectorModule.ts`

### Phase 3 — Reusable UI Components
17. `src/components/ui/Button.tsx` — primary (red filled), secondary (outlined), text variants
18. `src/components/ui/Header.tsx` — back arrow, title, optional right action icon
19. `src/components/ui/Card.tsx` — standard wrapper with theme border/radius
20. `src/components/ui/MarkerThumbnail.tsx` — 300×300, accepts URI, shows placeholder if null
21. `src/components/ui/ProgressRing.tsx` — circular progress, red stroke, shows percentage
22. `src/components/scanner/ScanOverlay.tsx` — transparent overlay, corner bracket reticle SVG
23. `src/components/scanner/DetectionIndicator.tsx` — animated corner brackets (Reanimated pulse)
24. `src/components/scanner/FrameCounter.tsx` — "X / 20" badge, top-right
25. `src/components/collection/MarkerGrid.tsx` — FlatList, 4 columns
26. `src/components/collection/MarkerGridItem.tsx` — single cell, 300×300, press handler

### Phase 4 — Screens (build in this order)
27. `SplashScreen.tsx` — logo, subtitle, 1500ms auto-navigate
28. `OnboardingScreen.tsx` — 2 slides, progress dots, Skip + Next
29. `HomeScreen.tsx` — header, feature cards, CTA
30. `ScannerScreen.tsx` — camera + overlay + detection + auto-capture + frame counter
31. `ProcessingScreen.tsx` — progress ring animation, auto-advance
32. `PreviewScreen.tsx` — marker preview, rotate/delete actions, add to collection
33. `CollectionScreen.tsx` — grid, count, view collection CTA
34. `MarkerDetailScreen.tsx` — metadata table, share CTA
35. `ShareScreen.tsx` — share options grid, native share sheet
36. `SettingsScreen.tsx` — settings rows with toggles and chevrons
37. `CompletionScreen.tsx` — checkmark, success message, CTAs

### Phase 5 — Navigation + Hooks
38. `src/navigation/AppNavigator.tsx` — root stack, all screens registered
39. `src/hooks/useCameraPermission.ts` — permission request flow
40. `src/hooks/useMarkerDetection.ts` — frame processor hook, stability lock, cooldown logic
41. `src/hooks/useOnboarding.ts` — AsyncStorage first-launch flag

### Phase 6 — Polish + Build
42. Wire all navigation flows (verify every CTA navigates correctly)
43. Add all micro-interactions from `PRD.md` section 9
44. Verify all 20 captures display at exactly 300×300px
45. Test against incorrect marker images — confirm zero false positives
46. Generate release APK: `cd android && ./gradlew assembleRelease`

---

## Critical Rules

### Architecture Rules
- Detection logic lives ENTIRELY in Kotlin — never in JS or TypeScript
- Frame processor uses JSI — never the React Native bridge for frame data
- Zustand stores hold URIs only — never raw image bytes or base64
- Use `FlatList` for the collection grid — never `map()` in JSX for long lists
- All animations use `react-native-reanimated` worklets — no `Animated` from React Native core

### Code Quality Rules
- All files are TypeScript with strict mode
- No `any` types
- All components have explicit prop interfaces
- Screen components use `NativeStackScreenProps<RootStackParamList, 'ScreenName'>` typing
- No inline styles — all styles via `StyleSheet.create()` using theme tokens

### Design Rules
- Never use colors not in `src/theme/colors.ts`
- Never use font sizes not in `src/theme/typography.ts`
- Red accent (`#FF4D4D`) ONLY on: CTAs, active detection state, progress indicators
- Every screen uses `SafeAreaView` from `react-native-safe-area-context`
- Status bar: dark content on light screens, light content on Scanner screen

### Performance Rules (from STACK.md section 8)
- Frame processor FPS capped at 15
- No blocking operations on the JS thread
- Images saved as JPEG quality 95, not PNG
- Memoize the frameProcessor callback

---

## Marker Design Reference

The marker being detected is:
- A square with a solid black border (8% of total size)
- One filled black square in the TOP-LEFT corner of the inner area (20% × 20% of inner area)
- All other inner area is white/empty
- Total inner empty area = ~64% of marker (satisfies ≥60% requirement)

This is **Marker 1** from the assignment PDF. The corner anchor is the key fingerprint — it makes the marker unique and enables orientation detection.

---

## File Reference Summary

| File | What it Contains |
|------|-----------------|
| `PRD.md` | All screen specs, design tokens, navigation, state, animations |
| `DETECTION_ENGINE.md` | Full OpenCV pipeline, all algorithm steps, performance targets |
| `STACK.md` | Package versions, file structure, theme code, build config |
| `DESIGN_REFERENCE.png` | Visual reference for all 11 screens — pixel-perfect reference |

---

Start with Phase 1. After completing each phase, confirm it compiles and runs before moving to the next phase.
