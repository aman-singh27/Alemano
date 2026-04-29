# Detection Engine — Technical Specification
## Alemeno Marker Scanner

---

## 1. Chosen Marker: Marker 1 (L-Corner Anchor)

We use **Marker 1** — the square border with a filled black square in the top-left corner.

### Why Marker 1
- The corner anchor square gives a **deterministic orientation reference** — you always know which rotation is "up"
- Single outer contour + single inner contour = clean, fast OpenCV pipeline
- Robust to distance and partial occlusion
- The asymmetry (one filled corner) makes it impossible to confuse with a symmetric shape like a window frame or picture frame

### Marker Geometry Specification
```
Outer square:  100% of marker size (e.g. 10cm × 10cm)
Border width:  ~8% of marker size (e.g. 8mm)
Corner anchor: Filled black square, top-left inner corner
               Size: ~20% × 20% of inner area (e.g. 1.7cm × 1.7cm)
Inner empty area: ~64% of total marker (satisfies ≥60% constraint)
Color: Pure black (#000000) on white (#FFFFFF)
```

---

## 2. Full Detection Pipeline

### Step 0 — Frame Acquisition
- Source: `react-native-vision-camera` frame processor
- Resolution: 2000×2000px (default) up to 3000×3000px
- Color space: YUV → converted to grayscale in native module
- Target: 30fps frame rate, detection runs on every frame

### Step 1 — Preprocessing (Native Kotlin / OpenCV)
```
Input: YUV frame bytes
1. Convert YUV → Mat (grayscale)
2. GaussianBlur(kernel=5×5, sigmaX=0) — reduces noise
3. adaptiveThreshold(
     maxVal=255,
     method=ADAPTIVE_THRESH_GAUSSIAN_C,
     type=THRESH_BINARY_INV,
     blockSize=11,
     C=2
   )
   → Binary image: black regions = white pixels, white bg = black pixels
```

### Step 2 — Contour Detection
```
4. findContours(mode=RETR_TREE, method=CHAIN_APPROX_SIMPLE)
   → Returns hierarchy of contours

5. For each contour:
   a. Filter by area: minArea = (frameWidth * 0.1)^2, maxArea = (frameWidth * 0.9)^2
   b. approxPolyDP(epsilon=0.02 * arcLength, closed=true)
   c. Keep only contours with exactly 4 vertices (quadrilaterals)
   d. Check aspect ratio: width/height must be 0.8–1.2 (roughly square)
```

### Step 3 — Marker Fingerprint Validation
This is the critical step that eliminates false positives.

```
6. For each candidate quadrilateral:
   a. Apply perspective transform (getPerspectiveTransform) to normalize
      the quad to a 200×200px canonical square
   b. Run fingerprint checks on the normalized image:

   CHECK A — Border Uniformity
   - Sample the outer 10% ring of the normalized image
   - Expect ≥85% black pixels in this ring
   - If <85%, reject (not our marker border)

   CHECK B — Inner Empty Zone
   - Sample the central 60% of the normalized image
   - Expect ≤20% black pixels (it should be mostly white/empty)
   - If >20%, reject (too much internal structure)

   CHECK C — Corner Anchor Detection
   - Divide inner area into 4 quadrants (TL, TR, BL, BR)
   - Sample each quadrant for black pixel density
   - Exactly ONE quadrant must have ≥70% black pixel density
   - The other three must have ≤15% black pixel density
   - If condition not met, reject

   CHECK D — Corner Anchor Position Logging
   - Record WHICH quadrant has the anchor (TL/TR/BL/BR)
   - This determines orientation correction angle
```

### Step 4 — Orientation Correction
```
7. Based on anchor quadrant from CHECK D:
   - Anchor in TL → 0° rotation (correct orientation, no change)
   - Anchor in TR → rotate 90° clockwise
   - Anchor in BR → rotate 180°
   - Anchor in BL → rotate 270° clockwise (= 90° counter-clockwise)

8. Apply warpAffine with the appropriate rotation matrix
   Center of rotation = center of the 200×200 canonical image
```

### Step 5 — Extraction & Resize
```
9. warpPerspective on ORIGINAL high-res frame using the 4 corner points
   → Extract tight crop of marker (no padding)

10. resize(output, Size(300, 300), interpolation=INTER_LANCZOS4)
    → Final 300×300px output

11. Encode to JPEG (quality=95) → save to app cache dir
    → Return file URI to JS layer
```

---

## 3. False Positive Rejection Strategy

The three-check fingerprint (border + inner empty + single corner anchor) makes false positives near-impossible. Specifically:

| Object | Why it fails |
|--------|-------------|
| Window frame | Fails CHECK B (interior not empty — you see through it, but camera captures background) |
| Picture frame | Fails CHECK C (no corner anchor) |
| Whiteboard | Fails CHECK A (no uniform black border) |
| Book cover | Fails CHECK B (interior has content/color) |
| Monitor bezel | Fails CHECK C (no corner anchor) or CHECK A |
| QR code | Fails CHECK B (interior full of data patterns, >20% black) |
| ArUco marker | Would need to have exact same geometry — functionally impossible unless it IS our marker |

---

## 4. Stability Lock — Anti-Duplicate Capture

To ensure the 20 captures come from **20 different frames** (not the same marker 20 times):

```
- Maintain a "lock" after each successful capture: 1500ms cooldown
- During cooldown: detection continues but capture is suppressed
- Track last captured frame's corner points
- If new detection corner points are within 15px of previous capture → skip
  (same marker, no movement)
- Only fire auto-capture if marker has been stable for 500ms (debounce)
  AND lock period has elapsed
```

---

## 5. Performance Targets

| Operation | Target | Approach |
|-----------|--------|---------|
| Preprocessing | <10ms | Native OpenCV, grayscale only |
| Contour detection | <15ms | Area pre-filter before approxPolyDP |
| Fingerprint check | <8ms | Sample-based (not full pixel scan) |
| Perspective extraction | <5ms | Single warpPerspective call |
| Resize + save | <10ms | Lanczos on small region only |
| **Total pipeline** | **<50ms** | Well within 3000ms target |
| JS → Native → JS round trip | ~20ms | JSI frame processor (not bridge) |

**Total scan-to-result time target: <500ms** (well under the 3000ms maximum).

---

## 6. Native Module Architecture

### Files to Create
```
android/app/src/main/java/com/alemenomarkerscanner/
├── MarkerDetectorModule.kt        — React Native module registration
├── MarkerDetector.kt              — Core OpenCV detection logic
├── FrameProcessorPlugin.kt        — VisionCamera frame processor hook
└── MarkerDetectorPackage.kt       — Package registration
```

### JS Interface
```typescript
// Called from frame processor (runs on camera thread)
const detectionResult = detectMarker(frame);
// Returns: { detected: boolean, corners: number[][], orientation: number } | null

// Called to extract + save after detection confirmed
const extractResult = await MarkerDetectorModule.extractMarker(
  frameData: string,  // base64 or file URI
  corners: number[][]
);
// Returns: { uri: string, width: 300, height: 300, orientation: number, fileSize: number }
```

---

## 7. OpenCV Android Integration

### Setup (android/app/build.gradle)
```gradle
dependencies {
    implementation 'org.opencv:opencv:4.8.0'  // Maven Central
}
```

### No OpenCV Manager needed — use static initialization:
```kotlin
companion object {
    init {
        System.loadLibrary("opencv_java4")
    }
}
```

---

## 8. VisionCamera Frame Processor Setup

```typescript
// In Scanner screen
const frameProcessor = useFrameProcessor((frame) => {
  'worklet';
  const result = detectMarker(frame);  // calls native plugin
  if (result?.detected) {
    runOnJS(handleDetection)(result);
  }
}, [handleDetection]);
```

Key config:
```typescript
<Camera
  ref={cameraRef}
  device={device}
  isActive={isActive}
  frameProcessor={frameProcessor}
  frameProcessorFps={15}  // 15fps for detection, saves battery
  photo={true}
  videoStabilizationMode="auto"
  // Force high resolution
  format={format}  // selected format ≥ 2000px
/>
```

---

## 9. Camera Format Selection

```typescript
const format = useMemo(() => {
  const formats = device?.formats ?? [];
  return formats
    .filter(f => 
      f.photoWidth >= 2000 && 
      f.photoWidth <= 3000 &&
      f.photoHeight >= 2000 &&
      f.photoHeight <= 3000
    )
    .sort((a, b) => b.photoWidth - a.photoWidth)[0]  // prefer larger
    ?? formats.sort((a, b) => b.photoWidth - a.photoWidth)[0];  // fallback: largest available
}, [device]);
```

---

## 10. Required Permissions (AndroidManifest.xml)

```xml
<uses-permission android:name="android.permission.CAMERA" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
    android:maxSdkVersion="28" />
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.VIBRATE" />
<uses-feature android:name="android.hardware.camera" android:required="true" />
<uses-feature android:name="android.hardware.camera.autofocus" android:required="false" />
```
