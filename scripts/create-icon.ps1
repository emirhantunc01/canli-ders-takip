Add-Type -AssemblyName System.Drawing
$taskBitmap = [System.Drawing.Bitmap]::new(256, 256)
$taskGraphics = [System.Drawing.Graphics]::FromImage($taskBitmap)
$taskGraphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
$taskGraphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit
$taskGraphics.Clear([System.Drawing.Color]::FromArgb(242,244,247))
$taskFont = [System.Drawing.Font]::new('Cambria Math', 152, [System.Drawing.FontStyle]::Regular, [System.Drawing.GraphicsUnit]::Pixel)
$taskBrush = [System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(23,25,28))
$taskGraphics.DrawString([char]0x2211, $taskFont, $taskBrush, [single]44, [single]26)
$taskStream = [System.IO.MemoryStream]::new()
$taskBitmap.Save($taskStream, [System.Drawing.Imaging.ImageFormat]::Png)
$taskBytes = $taskStream.ToArray()
$taskOut = [System.IO.File]::Create((Join-Path $PSScriptRoot '../desktop/icon.ico'))
$taskWriter = [System.IO.BinaryWriter]::new($taskOut)
$taskWriter.Write([uint16]0); $taskWriter.Write([uint16]1); $taskWriter.Write([uint16]1)
$taskWriter.Write([byte]0); $taskWriter.Write([byte]0); $taskWriter.Write([byte]0); $taskWriter.Write([byte]0)
$taskWriter.Write([uint16]1); $taskWriter.Write([uint16]32); $taskWriter.Write([uint32]$taskBytes.Length); $taskWriter.Write([uint32]22)
$taskWriter.Write($taskBytes)
$taskWriter.Dispose(); $taskStream.Dispose(); $taskFont.Dispose(); $taskBrush.Dispose(); $taskGraphics.Dispose(); $taskBitmap.Dispose()
