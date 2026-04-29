# Marker Design — Measurements & Generation Logic
## Alemeno Marker Scanner

---

## Marker 1 — L-Corner Anchor Marker

This is the chosen marker for detection. It satisfies all assignment constraints:
- Black and white only ✓
- Square overall shape ✓
- ≥60% inner area empty ✓

---

## Exact Geometry (Normalized to 1000×1000px)

```
Total marker size:         1000 × 1000 px

Outer border:
  Top bar:                 x=0,   y=0,   w=1000, h=80
  Bottom bar:              x=0,   y=920, w=1000, h=80
  Left bar:                x=0,   y=0,   w=80,   h=1000
  Right bar:               x=920, y=0,   w=80,   h=1000

Inner area:                x=80,  y=80,  w=840,  h=840
  (fills white by default)

Corner anchor (top-left):
  x=80,  y=80,  w=168, h=168
  (= 20% of 840px inner area)

Inner empty area:
  Total inner = 840 × 840 = 705,600 px²
  Anchor = 168 × 168    = 28,224 px²
  Empty  = 705,600 - 28,224 = 677,376 px²
  % empty = 677,376 / 705,600 = 96% ✓ (well above 60% requirement)
```

---

## Physical Print Measurements (10cm × 10cm print)

```
Total size:         100mm × 100mm

Border width:       8mm (all four sides)
Inner area:         84mm × 84mm (starts at 8mm from each edge)

Corner anchor:      16.8mm × 16.8mm
  Position:         top-left of inner area
  Offset from edge: 8mm from top, 8mm from left
```

---

## SVG Generation Code

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000" width="1000" height="1000">
  <!-- White background -->
  <rect width="1000" height="1000" fill="white"/>
  
  <!-- Top border -->
  <rect x="0" y="0" width="1000" height="80" fill="black"/>
  
  <!-- Bottom border -->
  <rect x="0" y="920" width="1000" height="80" fill="black"/>
  
  <!-- Left border -->
  <rect x="0" y="0" width="80" height="1000" fill="black"/>
  
  <!-- Right border -->
  <rect x="920" y="0" width="80" height="1000" fill="black"/>
  
  <!-- Corner anchor (top-left) -->
  <rect x="80" y="80" width="168" height="168" fill="black"/>
</svg>
```

---

## Programmatic Generation (JavaScript)

```javascript
function generateMarker(size = 1000) {
  const borderPct = 0.08;         // 8% border
  const anchorPct = 0.20;         // 20% of inner area for anchor
  
  const border = size * borderPct;
  const innerSize = size - (2 * border);
  const anchorSize = innerSize * anchorPct;
  
  return {
    canvas: { w: size, h: size },
    rects: [
      // Borders
      { x: 0, y: 0, w: size, h: border, fill: 'black' },           // top
      { x: 0, y: size - border, w: size, h: border, fill: 'black' }, // bottom
      { x: 0, y: 0, w: border, h: size, fill: 'black' },           // left
      { x: size - border, y: 0, w: border, h: size, fill: 'black' }, // right
      // Corner anchor (top-left of inner area)
      { x: border, y: border, w: anchorSize, h: anchorSize, fill: 'black' },
    ]
  };
}
```

---

## Detection Fingerprint Summary

When normalized to 200×200px for detection:

| Region | Expected black pixel % |
|--------|----------------------|
| Outer ring (10% border) | ≥85% |
| Inner area (central 60%) | ≤20% |
| Top-left quadrant | ≥70% |
| Top-right quadrant | ≤15% |
| Bottom-left quadrant | ≤15% |
| Bottom-right quadrant | ≤15% |

---

## Test Orientations

The corner anchor position tells the app how to correct orientation:

| Anchor Location | Meaning | Correction |
|----------------|---------|-----------|
| Top-left | Upright | 0° |
| Top-right | Rotated 90° CW | Rotate 90° CCW |
| Bottom-right | Upside down | Rotate 180° |
| Bottom-left | Rotated 90° CCW | Rotate 90° CW |

---

## Printable Versions

Generate and include in `/test-images/correct/`:
- `marker_0deg.png` — normal orientation
- `marker_90deg.png` — rotated 90° clockwise
- `marker_180deg.png` — upside down
- `marker_270deg.png` — rotated 270° clockwise
- `marker_angled_30.png` — slight perspective skew
- `marker_angled_45.png` — 45° perspective

Generate and include in `/test-images/incorrect/`:
- Plain square border (no corner anchor) — should FAIL CHECK C
- QR code — should FAIL CHECK B
- Window frame photo — should FAIL context checks
- Picture frame photo — should FAIL CHECK C
- Simple rectangle — should FAIL aspect ratio check
