Generated test markers

Files in this folder:

- `marker_A.svg` — base marker A (1200x1200 SVG, 100px padding, central 8x8 grid, cell=100px)
- `marker_A_rot90.svg` — rotated 90° variant
- `marker_A_rot45.svg` — rotated 45° variant
- `marker_B.svg` — alternate marker pattern

Measurements / layout

- Canvas: 1200 x 1200 px
- Outer padding (white): 100 px on each edge
- Outer border square: 100px..1100px (drawn with 12px stroke)
- Central marker area: 800 x 800 px placed at (200,200)
- Grid: 8 x 8 cells, each cell = 100 x 100 px

Generation logic

- Markers are high-contrast black/white grids inside a bordered square to ensure robust detection.
- The outer white padding + thick black border improves camera framing and reduces edge clipping.
- Patterns are intentionally asymmetric so a detector can disambiguate rotations.

Converting to PNG and creating rotated PNGs

- Using ImageMagick (Windows / macOS / Linux):

```bash
magick convert marker_A.svg -background white -flatten -resize 1200x1200 marker_A.png
magick convert marker_A.svg -background white -flatten -rotate 90 marker_A_rot90.png
magick convert marker_A.svg -background white -flatten -rotate 45 marker_A_rot45.png
```

- Using Inkscape (CLI):

```bash
inkscape marker_A.svg --export-type=png --export-width=1200 --export-height=1200 --export-filename=marker_A.png
```

Notes

- The SVGs include explicit padding and an outer border — when rasterizing to PNG ensure background is white (some viewers render SVG transparent background by default).
- If you want additional sizes, rasterize at higher resolution and scale down.

If you want, I can:

- Produce PNG files here and add them to the repo (if you prefer ready-to-use PNGs).
- Generate more unique marker patterns or a small set for training/validation.
