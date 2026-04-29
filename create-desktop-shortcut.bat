@echo off
echo Creating Aion OS Desktop Shortcut...

REM Get the current directory
set SCRIPT_DIR=%~dp0
set SHORTCUT_PATH=%USERPROFILE%\Desktop\Aion OS.lnk

REM Create VBScript to generate the shortcut
set VBS_PATH=%TEMP%\CreateShortcut.vbs

(
echo Set oWS = WScript.CreateObject^("WScript.Shell"^)
echo sLinkFile = "%SHORTCUT_PATH%"
echo Set oLink = oWS.CreateShortcut^(sLinkFile^)
echo oLink.TargetPath = "%SCRIPT_DIR%start-aion.bat"
echo oLink.Arguments = ""
echo oLink.WorkingDirectory = "%SCRIPT_DIR%"
echo oLink.Description = "Aion OS - AI Desktop Platform"
echo oLink.IconLocation = "%SystemRoot%\System32\imageres.dll,5"
echo oLink.WindowStyle = 1
echo oLink.Save
) > "%VBS_PATH%"

REM Execute the VBScript
cscript //nologo "%VBS_PATH%"

REM Clean up
del "%VBS_PATH%"

echo.
echo ✓ Desktop shortcut created successfully!
echo.
echo You can now launch Aion OS from your desktop.
echo.
pause
