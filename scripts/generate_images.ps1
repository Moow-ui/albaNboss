
Add-Type -AssemblyName System.Drawing

$baseDir = Split-Path -Parent $PSScriptRoot

# 1. Generate favicon.png (64x64)
$favPath = Join-Path $baseDir "assets\icons\favicon.png"
$favDir = Split-Path -Parent $favPath
if (-not (Test-Path $favDir)) { New-Item -ItemType Directory -Path $favDir -Force }

$favBmp = New-Object System.Drawing.Bitmap 64, 64
$favG = [System.Drawing.Graphics]::FromImage($favBmp)
$favG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$favG.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 15, 23, 42))
$favG.FillRectangle($bgBrush, 0, 0, 64, 64)

$fontA = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)
$fontAmp = New-Object System.Drawing.Font("Arial", 16, [System.Drawing.FontStyle]::Bold)
$fontB = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Bold)

$whiteBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
$blueBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(255, 59, 130, 246))

$favG.DrawString("A", $fontA, $whiteBrush, 8, 14)
$favG.DrawString("&", $fontAmp, $blueBrush, 26, 18)
$favG.DrawString("B", $fontB, $whiteBrush, 40, 14)

$favBmp.Save($favPath, [System.Drawing.Imaging.ImageFormat]::Png)
$favG.Dispose()
$favBmp.Dispose()
Write-Host "Generated: $favPath"

# 2. Generate og-image.png (1200x630)
$ogPath = Join-Path $baseDir "assets\images\og-image.png"
$ogDir = Split-Path -Parent $ogPath
if (-not (Test-Path $ogDir)) { New-Item -ItemType Directory -Path $ogDir -Force }

$ogBmp = New-Object System.Drawing.Bitmap 1200, 630
$ogG = [System.Drawing.Graphics]::FromImage($ogBmp)
$ogG.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$ogG.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

$rect = New-Object System.Drawing.Rectangle 0, 0, 1200, 630
$gradBrush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(255, 15, 23, 42),
    [System.Drawing.Color]::FromArgb(255, 30, 41, 59),
    45.0
)
$ogG.FillRectangle($gradBrush, $rect)

# Border
$pen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 51, 65, 85), 2)
$ogG.DrawRectangle($pen, 36, 36, 1128, 558)

# Badge background
$badgeBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 37, 99, 235))
$ogG.FillRectangle($badgeBrush, 80, 80, 360, 44)

# Badge Text
$badgeFont = New-Object System.Drawing.Font("Malgun Gothic", 13, [System.Drawing.FontStyle]::Bold)
$ogG.DrawString("사장님 & 알바생 필수 노무 계산 포털", $badgeFont, $whiteBrush, 96, 92)

# Main Title: ALBA & BOSS
$titleFont = New-Object System.Drawing.Font("Arial", 60, [System.Drawing.FontStyle]::Bold)
$ogG.DrawString("ALBA", $titleFont, $whiteBrush, 76, 160)
$ogG.DrawString("&", $titleFont, $blueBrush, 320, 160)
$ogG.DrawString("BOSS", $titleFont, $whiteBrush, 400, 160)

# Subtitle
$subFont = New-Object System.Drawing.Font("Malgun Gothic", 22, [System.Drawing.FontStyle]::Bold)
$grayBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 148, 163, 184))
$ogG.DrawString("2026년 최저시급(10,320원) 기준 스마트 노무·급여 계산기", $subFont, $grayBrush, 80, 270)

# 3 Feature Cards
$cardBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 30, 41, 59))
$cardPen = New-Object System.Drawing.Pen([System.Drawing.Color]::FromArgb(255, 51, 65, 85), 1.5)
$cardTitleFont = New-Object System.Drawing.Font("Malgun Gothic", 15, [System.Drawing.FontStyle]::Bold)
$cardDescFont = New-Object System.Drawing.Font("Malgun Gothic", 12, [System.Drawing.FontStyle]::Regular)

# Card 1: 사장님 시급 계산기
$ogG.FillRectangle($cardBrush, 80, 370, 320, 130)
$ogG.DrawRectangle($cardPen, 80, 370, 320, 130)
$ogG.DrawString("사장님 시급 계산기", $cardTitleFont, $whiteBrush, 100, 400)
$ogG.DrawString("주휴수당 · 4대보험 · 총인건비", $cardDescFont, $grayBrush, 100, 445)

# Card 2: 알바 급여 계산기
$ogG.FillRectangle($cardBrush, 440, 370, 320, 130)
$ogG.DrawRectangle($cardPen, 440, 370, 320, 130)
$ogG.DrawString("알바 급여 계산기", $cardTitleFont, $whiteBrush, 460, 400)
$ogG.DrawString("실수령액 · 가산수당 · 주휴수당", $cardDescFont, $grayBrush, 460, 445)

# Card 3: 근무표 완성기
$ogG.FillRectangle($cardBrush, 800, 370, 320, 130)
$ogG.DrawRectangle($cardPen, 800, 370, 320, 130)
$ogG.DrawString("근무표 완성기", $cardTitleFont, $whiteBrush, 820, 400)
$ogG.DrawString("알바 스케줄 자동 교대 배정", $cardDescFont, $grayBrush, 820, 445)

# Watermark URL
$urlFont = New-Object System.Drawing.Font("Arial", 14, [System.Drawing.FontStyle]::Bold)
$dimBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(255, 100, 116, 139))
$ogG.DrawString("albanboss.moow-ui.workers.dev", $urlFont, $dimBrush, 860, 545)

$ogBmp.Save($ogPath, [System.Drawing.Imaging.ImageFormat]::Png)
$ogG.Dispose()
$ogBmp.Dispose()
Write-Host "Generated: $ogPath"
