$taskExecutable = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../release/win-unpacked/Ders Defteri.exe'))
if (-not (Test-Path -LiteralPath $taskExecutable)) { throw 'Önce Windows paketi oluşturulmalı.' }
$taskDesktop = [Environment]::GetFolderPath('DesktopDirectory')
$taskShortcutPath = Join-Path $taskDesktop 'Ders Defteri.lnk'
if (Test-Path -LiteralPath $taskShortcutPath) { Write-Output 'Masaüstü kısayolu zaten var; değiştirilmedi.'; exit 0 }
$taskShell = New-Object -ComObject WScript.Shell
$taskShortcut = $taskShell.CreateShortcut($taskShortcutPath)
$taskShortcut.TargetPath = $taskExecutable
$taskShortcut.WorkingDirectory = Split-Path -Parent $taskExecutable
$taskShortcut.IconLocation = "$taskExecutable,0"
$taskShortcut.Description = 'Matematik dersleri ve ödeme takibi'
$taskShortcut.Save()
Write-Output "Kısayol oluşturuldu: $taskShortcutPath"
