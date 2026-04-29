# Tech Stack & Architecture
## Alemeno Marker Scanner

---

## 1. Stack Decisions

| Layer | Choice | Version | Reason |
|-------|--------|---------|--------|
| Framework | React Native | 0.73+ | Required by assignment |
| Platform | Android only | SDK 26+ (Android 8.0) | Assignment requirement |
| Language | TypeScript | 5.x | Type safety across app |
| Camera | react-native-vision-camera | v4 | Frame processor API, JSI-based (fast), high-res support |
| Detection | OpenCV Android SDK | 4.8.0 | Industry standard CV, deterministic, fast |
| Native bridge | Kotlin | — | Modern Android, null safety |
| Navigation | @react-navigation/native + stack | v6 | Standard, well-maintained |
| State | Zustand | v4 | Minimal boilerplate, no provider hell |
| Storage | @react-native-async-storage/async-storage | v1 | Onboarding flag, settings persistence |
| Animations | react-native-reanimated | v3 | Worklet-based, no JS thread blocking |
| File system | react-native-fs | v2 | Save extracted marker images locally |
| Haptics | react-native-haptic-feedback | v2 | Vibration on capture |
| Icons | react-native-vector-icons (MaterialIcons) | v10 | Clean icon set matching design |
| Share | react-native-share | v10 | Native share sheet |

---

## 2. Project Structure

```
AlemanoMarkerScanner/
├── android/
│   └── app/src/main/java/com/alemenomarkerscanner/
│       ├── MarkerDetector.kt
│       ├── MarkerDetectorModule.kt
│       ├── MarkerDetectorPackage.kt
│       └── FrameProcessorPlugin.kt
├── src/
│   ├── components/
│   │   ├── ui/
│   │   │   ├── Button.tsx           — Primary/secondary/text variants
│   │   │   ├── Card.tsx             — Standard card wrapper
│   │   │   ├── Header.tsx           — Screen header with back/action
│   │   │   ├── MarkerThumbnail.tsx  — 300×300 marker display
│   │   │   └── ProgressRing.tsx     — Circular progress (Processing screen)
│   │   ├── scanner/
│   │   │   ├── CameraView.tsx       — VisionCamera wrapper + frame processor
│   │   │   ├── ScanOverlay.tsx      — Reticle + corner brackets SVG
│   │   │   ├── DetectionIndicator.tsx — Animated corner brackets
│   │   │   └── FrameCounter.tsx     — "X / 20" badge
│   │   └── collection/
│   │       ├── MarkerGrid.tsx       — 4-column grid
│   │       └── MarkerGridItem.tsx   — Single grid cell
│   ├── screens/
│   │   ├── SplashScreen.tsx
│   │   ├── OnboardingScreen.tsx
│   │   ├── HomeScreen.tsx
│   │   ├── ScannerScreen.tsx
│   │   ├── ProcessingScreen.tsx
│   │   ├── PreviewScreen.tsx
│   │   ├── CollectionScreen.tsx
│   │   ├── MarkerDetailScreen.tsx
│   │   ├── ShareScreen.tsx
│   │   ├── SettingsScreen.tsx
│   │   └── CompletionScreen.tsx
│   ├── navigation/
│   │   ├── AppNavigator.tsx         — Root stack navigator
│   │   └── types.ts                 — Screen param types
│   ├── store/
│   │   ├── useMarkerStore.ts        — Zustand store (markers, count)
│   │   └── useSettingsStore.ts      — Zustand store (settings)
│   ├── hooks/
│   │   ├── useMarkerDetection.ts    — Detection logic + frame processor
│   │   ├── useCameraPermission.ts   — Camera permission flow
│   │   └── useOnboarding.ts        — First-launch flag
│   ├── native/
│   │   └── MarkerDetectorModule.ts  — JS interface to native Kotlin module
│   ├── theme/
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   ├── spacing.ts
│   │   └── index.ts
│   └── utils/
│       ├── imageUtils.ts            — File handling, base64 helpers
│       └── formatters.ts           — Date, filesize formatters
├── docs/
│   ├── PRD.md                       — This PRD
│   ├── DETECTION_ENGINE.md          — Detection spec
│   ├── STACK.md                     — This file
│   └── APPROACH.pdf                 — Final deliverable PDF
├── test-images/
│   ├── correct/                     — Valid marker test images
│   └── incorrect/                   — False positive test images
└── marker-design/
    ├── marker.svg                   — Printable marker
    ├── marker.png                   — 1000×1000px PNG
    └── MEASUREMENTS.md              — Exact geometry spec
```

---

## 3. Theme Tokens

### colors.ts
```typescript
export const colors = {
  background: '#F7F7F7',
  surface: '#FFFFFF',
  textPrimary: '#111111',
  textSecondary: '#666666',
  accent: '#FF4D4D',
  accentLight: '#FFE5E5',
  border: '#E5E5E5',
  scannerOverlay: 'rgba(0,0,0,0.6)',
  scannerReticle: '#FF4D4D',
  scannerReticleActive: '#FF4D4D',
  success: '#22C55E',
  white: '#FFFFFF',
  black: '#000000',
};
```

### spacing.ts
```typescript
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
  screenPadding: 20,
};
```

### typography.ts
```typescript
export const typography = {
  h1: { fontSize: 28, fontWeight: '700' as const, color: colors.textPrimary },
  h2: { fontSize: 20, fontWeight: '600' as const, color: colors.textPrimary },
  body: { fontSize: 14, fontWeight: '400' as const, color: colors.textPrimary },
  caption: { fontSize: 12, fontWeight: '400' as const, color: colors.textSecondary },
};
```

---

## 4. Navigation Types

```typescript
// navigation/types.ts
export type RootStackParamList = {
  Splash: undefined;
  Onboarding: undefined;
  Home: undefined;
  Scanner: undefined;
  Processing: { frameUri: string; corners: number[][] };
  Preview: { markerId: string };
  Collection: undefined;
  MarkerDetail: { markerId: string };
  Share: { markerId: string };
  Settings: undefined;
  Completion: undefined;
};
```

---

## 5. Data Model

```typescript
// types/index.ts
export interface MarkerCapture {
  id: string;              // uuid
  uri: string;             // local file:// path
  capturedAt: string;      // ISO string
  orientation: number;     // degrees corrected (0, 90, 180, 270)
  fileSize: number;        // bytes
  frameIndex: number;      // 1–20
  width: 300;
  height: 300;
}
```

---

## 6. Build Configuration

### android/app/build.gradle additions
```gradle
android {
    defaultConfig {
        minSdkVersion 26
        targetSdkVersion 34
        // Enable multidex for OpenCV
        multiDexEnabled true
    }
    // OpenCV requires these ABI filters
    splits {
        abi {
            enable true
            reset()
            include "arm64-v8a", "x86_64"
            universalApk true
        }
    }
}

dependencies {
    implementation 'org.opencv:opencv:4.8.0'
    implementation 'androidx.multidex:multidex:2.0.1'
}
```

---

## 7. Key Dependencies — package.json

```json
{
  "dependencies": {
    "react": "18.2.0",
    "react-native": "0.73.6",
    "react-native-vision-camera": "^4.5.1",
    "react-native-reanimated": "^3.8.1",
    "@react-navigation/native": "^6.1.17",
    "@react-navigation/stack": "^6.3.29",
    "react-native-screens": "^3.30.1",
    "react-native-safe-area-context": "^4.9.0",
    "zustand": "^4.5.2",
    "@react-native-async-storage/async-storage": "^1.23.1",
    "react-native-fs": "^2.20.0",
    "react-native-haptic-feedback": "^2.2.0",
    "react-native-vector-icons": "^10.1.0",
    "react-native-share": "^10.1.2",
    "react-native-gesture-handler": "^2.16.2",
    "uuid": "^9.0.1"
  }
}
```

---

## 8. Performance Rules (Non-Negotiable)

1. **Detection runs in native Kotlin** — never in JS
2. **Frame processor uses JSI** — never the React Native bridge for camera frames
3. **Images saved as JPEG** (quality 95) — not PNG, not base64 in state
4. **State holds URIs only** — never raw image data in Zustand
5. **Processing screen animations** use Reanimated worklets — no JS-thread animations
6. **FlatList** for collection grid — not map() over array
7. **Memoize** frameProcessor callback with `useCallback`
8. **Frame processor FPS capped at 15** — sufficient for detection, saves battery

---

## 9. Testing Checklist (Before APK build)

- [ ] Camera opens at ≥2000px resolution
- [ ] Marker detected in <500ms from entering frame
- [ ] Zero false positives on incorrect test images
- [ ] Orientation correction works for all 4 rotations
- [ ] Exactly 20 captures collected, no duplicates
- [ ] All 20 displayed at exactly 300×300px
- [ ] App doesn't crash when camera permission denied
- [ ] Settings persist across app restart
- [ ] Share sheet works for Gallery and Gmail
- [ ] Onboarding shown only on first launch
