@echo off
cd /d "%~dp0"
if exist "release\win-unpacked\Ders Defteri.exe" (
  start "" "release\win-unpacked\Ders Defteri.exe"
  exit /b 0
)
echo Hazir masaustu paketi bulunamadi.
echo Once npm install ve npm run package:win komutlariyla Windows paketini olusturun.
echo Veya DersDefteri-Kurulum.exe ile uygulamayi kurun.
pause
