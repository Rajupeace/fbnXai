Add-Type -AssemblyName System.Drawing

$assets = @(
    @{ Path = "logo192.png"; Size = 192 },
    @{ Path = "logo512.png"; Size = 512 }
)

$basePath = "c:\Users\rajub\OneDrive\Desktop\aiXfn\Friendly-NoteBook-main\Friendly-NoteBook-main\public"

foreach ($asset in $assets) {
    $size = $asset.Size
    $path = Join-Path $basePath $asset.Path

    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $gfx = [System.Drawing.Graphics]::FromImage($bmp)
    $gfx.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias

    $bgColor = [System.Drawing.ColorTranslator]::FromHtml('#10204f')
    $accent = [System.Drawing.ColorTranslator]::FromHtml('#38c0ff')

    $gfx.Clear($bgColor)

    $margin = [int]($size * 0.18)
    $brushAccent = New-Object System.Drawing.SolidBrush($accent)
    $gfx.FillEllipse($brushAccent, $margin, $margin, $size - (2 * $margin), $size - (2 * $margin))

    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::White)
    $fontSize = [int]($size * 0.32)
    if ($fontSize -lt 12) { $fontSize = 12 }

    try {
        $font = New-Object System.Drawing.Font('Segoe UI', $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    }
    catch {
        $font = New-Object System.Drawing.Font([System.Drawing.FontFamily]::GenericSansSerif, $fontSize, [System.Drawing.FontStyle]::Bold, [System.Drawing.GraphicsUnit]::Pixel)
    }

    $format = New-Object System.Drawing.StringFormat
    $format.Alignment = [System.Drawing.StringAlignment]::Center
    $format.LineAlignment = [System.Drawing.StringAlignment]::Center

    $gfx.DrawString('FN', $font, $textBrush, [System.Drawing.PointF]::new($size / 2, $size / 2), $format)

    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)

    $gfx.Dispose()
    $bmp.Dispose()
    $brushAccent.Dispose()
    $textBrush.Dispose()
    $font.Dispose()
    $format.Dispose()

    Write-Host ("Created {0} ({1}x{1})" -f $path, $size)
}
