# Product Requirements Document (PRD)
## Alemeno Marker Scanner — React Native Android App

---

### 1. Problem Statement

Alemeno requires a React Native Android application that detects a custom visual marker (similar to a QR code) using the device camera in real time. The app must identify, isolate, perspective-correct, and display exactly 20 extracted marker captures from 20 different frames. The solution must be fast (<3000ms total scan-to-result), accurate (no false positives), and orientation-robust.

---

### 2. Core Concept

A camera-first Android app that:
1. Shows a live camera feed at 2000–3000px resolution
2. Continuously scans frames for the custom marker using native OpenCV
3. Extracts and perspective-corrects each detected marker
4. Stores 20 unique captures (from 20 different frames)
5. Displays them in a 300×300px grid with rich metadata

---

### 3. Target User

Alemeno evaluators testing the internship submission. Secondary use: any operator needing to scan custom fiducial markers.

---

### 4. Design System

#### Color Palette
| Token | Value | Usage |
|-------|-------|-------|
| `background` | `#F7F7F7` | All screen backgrounds |
| `surface` | `#FFFFFF` | Cards, modals |
| `text-primary` | `#111111` | Headings, body |
| `text-secondary` | `#666666` | Subtitles, captions |
| `accent` | `#FF4D4D` | CTAs, highlights, progress |
| `border` | `#E5E5E5` | Dividers, card borders |
| `scanner-overlay` | `rgba(255,77,77,0.8)` | Corner reticles on detection |

#### Typography
| Style | Font | Weight | Size |
|-------|------|--------|------|
| H1 | Inter / System | 700 | 28sp |
| H2 | Inter / System | 600 | 20sp |
| Body | Inter / System | 400 | 14sp |
| Caption | Inter / System | 400 | 12sp |

#### Spacing
- Base unit: 8pt grid
- Card padding: 16px
- Screen padding: 20px horizontal
- Border radius: 12–16px (cards), 50px (buttons)

#### Component Style
- Flat design, no heavy shadows
- Thin borders (1px, `#E5E5E5`)
- Icon-first actions
- Red accent used **functionally only** (CTAs, active states, detection overlay)

---

### 5. Screen Inventory

| # | Screen | Route Name | Purpose |
|---|--------|-----------|---------|
| 01 | Splash | `Splash` | Brand entry, auto-advance after 1.5s |
| 02 | Home | `Home` | Entry point, feature summary, Start CTA |
| 03 | Scanner | `Scanner` | Core — live camera + detection |
| 04 | Processing | `Processing` | Post-capture pipeline animation |
| 05 | Collection | `Collection` | 4-col grid of captured markers, count progress |
| 06 | Preview | `Preview` | Single marker review, rotate/delete |
| 07 | MarkerDetail | `MarkerDetail` | Metadata view (timestamp, res, orientation) |
| 08 | Share | `Share` | Native share sheet |
| 09 | Settings | `Settings` | Camera res, flash, auto-capture, vibration |
| 10 | Onboarding | `Onboarding` | 2-screen walkthrough, shown once |
| 11 | Completion | `Completion` | Success state, 20/20 reached |

---

### 6. Screen Specifications

#### 01 — Splash Screen
- Centered Alemeno logo (red pentagon mark + wordmark)
- Subtitle: "Precision Marker Scanner"
- Caption: "Scan. Detect. Extract. With unmatched accuracy."
- White background
- Auto-navigate to Onboarding (first launch) or Home after 1500ms

#### 02 — Home Screen
- Header: Alemeno logo left, Settings icon right
- H1: "Scan custom markers with **precision**" (bold red on "precision")
- Subtext: "Real-time detection. Zero noise."
- 3 Feature cards (icon + title + subtitle):
  - High Accuracy — "Detects only valid markers"
  - Auto Correction — "Orientation & perspective correction"
  - Batch Capture — "Capture up to 20 markers at once"
- Full-width red CTA button: "Start Scanning"

#### 03 — Scanner Screen
- Full-screen camera feed (VisionCamera)
- Transparent overlay with square bracket reticle (centered, ~70% screen width)
- Corner brackets turn red + animated pulse when marker detected
- Bottom bar:
  - Left: Gallery icon (navigate to Collection)
  - Center: Large white capture button (red ring)
  - Right: Help/info icon
- Top bar: "Scanner" title, flash toggle icon
- Instruction toast: "Align the marker within the frame"
- **Auto-capture fires when marker is stable for 500ms**
- Frame counter badge: "3 / 20" top-right

#### 04 — Processing Screen
- Back arrow, "Processing" title
- Large circular progress indicator (red stroke on grey track)
- Center: preview of extracted marker (cropped, raw)
- Below: "Correcting orientation and enhancing…"
- Red percentage text: "78%"
- Auto-advances to Preview when done

#### 05 — Collection Screen
- Back arrow, "Collection" title
- Count subtitle: "12 / 20 Markers Scanned"
- 4-column grid of 300×300px thumbnails (thin border cards)
- Empty cells shown as placeholder grey squares
- Bottom CTA: "View Collection" (red button)

#### 06 — Preview Screen
- Back arrow, "Preview" title
- Count: "7 / 20" (large, centered)
- Large marker preview (300×300, centered)
- Three actions below:
  - Rotate Left (icon + label)
  - Rotate Right (icon + label)
  - Delete (icon + label, destructive)
- Bottom CTA: "Add to Collection" (red button)

#### 07 — Marker Detail Screen
- Share icon top right
- Large marker preview
- Metadata table (label — value):
  - Captured On — date/time
  - Resolution — 300 × 300 px
  - Orientation — Corrected
  - File Size — XX KB
- Bottom CTA: "Share Marker" (red button)

#### 08 — Share Screen
- "Share" title
- Marker preview
- "Share as" label
- 4 icons: Gallery · WhatsApp · Gmail · More
- "Cancel" text button below

#### 09 — Settings Screen
- Back arrow, "Settings" title
- Section: Camera
  - Resolution → High (3000 × 3000) [chevron row]
  - Flash → Auto [chevron row]
- Section: Detection
  - Auto Capture [toggle, default ON, red]
  - Vibration [toggle, default ON, red]
- Section: About
  - Version → 1.0.0
  - About Alemeno [chevron row]

#### 10 — Onboarding (2 screens)
- Screen 1:
  - Illustration: phone scanning marker
  - Title: "Smart Detection"
  - Body: "Our AI detects only valid markers and ignores everything else."
  - Progress dots: ● ○
  - "Next" button (red)
  - "Skip" top-right
- Screen 2:
  - Illustration: marker rotating with arrows
  - Title: "Auto Correction"
  - Body: "We automatically correct orientation and perspective for perfect results."
  - Progress dots: ○ ●
  - "Next" button (red)
  - "Skip" top-right

#### 11 — Completion Screen
- Large red checkmark icon (circle)
- H1: "All Set!"
- Body: "You have scanned 20 / 20 markers successfully."
- Primary CTA: "View Collection" (red button)
- Secondary CTA: "Scan More" (red text link)

---

### 7. Navigation Architecture

```
Stack Navigator (root)
├── Splash
├── Onboarding (shown once via AsyncStorage flag)
├── Home
├── Scanner
├── Processing
├── Preview
├── Collection
├── MarkerDetail
├── Share
├── Settings
└── Completion
```

All screens: `headerShown: false`, custom status bar (dark content on light screens).

---

### 8. State Management

Use **Zustand** for global state:

```typescript
interface AppState {
  capturedMarkers: MarkerCapture[];    // max 20
  scanCount: number;
  settings: {
    resolution: 2000 | 2500 | 3000;
    flash: 'auto' | 'on' | 'off';
    autoCapture: boolean;
    vibration: boolean;
  };
  addMarker: (marker: MarkerCapture) => void;
  removeMarker: (id: string) => void;
  clearAll: () => void;
}

interface MarkerCapture {
  id: string;
  uri: string;           // local file path, 300×300px
  capturedAt: Date;
  orientation: number;   // degrees corrected
  fileSize: number;      // bytes
  frameIndex: number;    // which of the 20 frames
}
```

---

### 9. Animations & Micro-interactions

| Trigger | Animation |
|---------|-----------|
| Marker detected | Corner brackets pulse red (scale 1→1.05→1, 300ms loop) |
| Capture fired | Screen flash (white overlay, 150ms fade) |
| Processing progress | Circular arc animates to percentage |
| Grid item added | Fade + scale in (200ms) |
| CTA buttons | Scale down on press (0.97, 100ms) |
| Screen transitions | Slide from right (standard stack) |

---

### 10. Deliverables Checklist

- [ ] Installable APK (release build)
- [ ] Public GitHub repo with README
- [ ] This PRD as PDF (approach doc)
- [ ] Marker design measurements / generation logic
- [ ] Test images (correct + incorrect) in `/test-images`
