$ErrorActionPreference = 'Stop'
Set-Location (Split-Path $PSScriptRoot -Parent)
Add-Type -AssemblyName System.Drawing

function New-LogoBitmap {
  param(
    [int]$Size
  )

  $bitmap = New-Object System.Drawing.Bitmap $Size, $Size
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.Clear([System.Drawing.Color]::White)

  $accent = [System.Drawing.ColorTranslator]::FromHtml('#FF4D4D')
  $white = [System.Drawing.Color]::White

  $outer = @(
    (New-Object System.Drawing.Point([int]($Size * 0.50), [int]($Size * 0.10))),
    (New-Object System.Drawing.Point([int]($Size * 0.90), [int]($Size * 0.40))),
    (New-Object System.Drawing.Point([int]($Size * 0.74), [int]($Size * 0.90))),
    (New-Object System.Drawing.Point([int]($Size * 0.26), [int]($Size * 0.90))),
    (New-Object System.Drawing.Point([int]($Size * 0.10), [int]($Size * 0.40)))
  )

  $inner = @(
    (New-Object System.Drawing.Point([int]($Size * 0.50), [int]($Size * 0.24))),
    (New-Object System.Drawing.Point([int]($Size * 0.64), [int]($Size * 0.42))),
    (New-Object System.Drawing.Point([int]($Size * 0.78), [int]($Size * 0.50))),
    (New-Object System.Drawing.Point([int]($Size * 0.64), [int]($Size * 0.58))),
    (New-Object System.Drawing.Point([int]($Size * 0.50), [int]($Size * 0.76))),
    (New-Object System.Drawing.Point([int]($Size * 0.36), [int]($Size * 0.58))),
    (New-Object System.Drawing.Point([int]($Size * 0.22), [int]($Size * 0.50))),
    (New-Object System.Drawing.Point([int]($Size * 0.36), [int]($Size * 0.42)))
  )

  $graphics.FillPolygon((New-Object System.Drawing.SolidBrush $accent), $outer)
  $graphics.FillPolygon((New-Object System.Drawing.SolidBrush $white), $inner)
  $graphics.Dispose()

  return $bitmap
}

function Save-Logo {
  param(
    [System.Drawing.Bitmap]$Bitmap,
    [string]$Path
  )

  $directory = Split-Path $Path -Parent
  if (-not (Test-Path $directory)) {
    New-Item -ItemType Directory -Path $directory -Force | Out-Null
  }

  $Bitmap.Save($Path, [System.Drawing.Imaging.ImageFormat]::Png)
}

$basePath = Join-Path $PWD 'src\assets\branding\logo.png'
$baseBitmap = New-LogoBitmap -Size 1024
Save-Logo -Bitmap $baseBitmap -Path $basePath
$baseBitmap.Dispose()

$androidSizes = @{
  'mipmap-mdpi' = 48
  'mipmap-hdpi' = 72
  'mipmap-xhdpi' = 96
  'mipmap-xxhdpi' = 144
  'mipmap-xxxhdpi' = 192
}

foreach ($entry in $androidSizes.GetEnumerator()) {
  $folder = Join-Path 'android\app\src\main\res' $entry.Key
  foreach ($name in @('ic_launcher.png', 'ic_launcher_round.png')) {
    $bitmap = New-LogoBitmap -Size $entry.Value
    Save-Logo -Bitmap $bitmap -Path (Join-Path $folder $name)
    $bitmap.Dispose()
  }
}

$iOSFiles = @(
  @{Path = 'ios\AlemanoMarkerScanner\Images.xcassets\AppIcon.appiconset\icon-20@2x.png'; Size = 40},
  @{Path = 'ios\AlemanoMarkerScanner\Images.xcassets\AppIcon.appiconset\icon-20@3x.png'; Size = 60},
  @{Path = 'ios\AlemanoMarkerScanner\Images.xcassets\AppIcon.appiconset\icon-29@2x.png'; Size = 58},
  @{Path = 'ios\AlemanoMarkerScanner\Images.xcassets\AppIcon.appiconset\icon-29@3x.png'; Size = 87},
  @{Path = 'ios\AlemanoMarkerScanner\Images.xcassets\AppIcon.appiconset\icon-40@2x.png'; Size = 80},
  @{Path = 'ios\AlemanoMarkerScanner\Images.xcassets\AppIcon.appiconset\icon-40@3x.png'; Size = 120},
  @{Path = 'ios\AlemanoMarkerScanner\Images.xcassets\AppIcon.appiconset\icon-60@2x.png'; Size = 120},
  @{Path = 'ios\AlemanoMarkerScanner\Images.xcassets\AppIcon.appiconset\icon-60@3x.png'; Size = 180},
  @{Path = 'ios\AlemanoMarkerScanner\Images.xcassets\AppIcon.appiconset\icon-1024.png'; Size = 1024}
)

foreach ($entry in $iOSFiles) {
  $bitmap = New-LogoBitmap -Size $entry.Size
  Save-Logo -Bitmap $bitmap -Path (Join-Path $PWD $entry.Path)
  $bitmap.Dispose()
}

Write-Host 'Branding assets generated.'