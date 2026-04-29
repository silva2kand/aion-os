# PowerShell script to create desktop shortcut for Aion OS
Write-Host "Creating Aion OS Desktop Shortcut..." -ForegroundColor Cyan

# Get paths
$scriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$desktopPath = [Environment]::GetFolderPath("Desktop")
$shortcutPath = Join-Path $desktopPath "Aion OS.lnk"

# Remove existing shortcut if it exists
if (Test-Path $shortcutPath) {
    Remove-Item $shortcutPath -Force
    Write-Host "Removed existing shortcut" -ForegroundColor Yellow
}

# Create the shortcut
$shell = New-Object -ComObject WScript.Shell
$shortcut = $shell.CreateShortcut($shortcutPath)

# Set shortcut properties
$shortcut.TargetPath = Join-Path $scriptDir "start-aion.bat"
$shortcut.Arguments = ""
$shortcut.WorkingDirectory = $scriptDir
$shortcut.Description = "Aion OS - AI Desktop Platform"
$shortcut.IconLocation = "%SystemRoot%\System32\imageres.dll,5"
$shortcut.WindowStyle = 1

# Save the shortcut
$shortcut.Save()

Write-Host ""
Write-Host "Success! Desktop shortcut created." -ForegroundColor Green
Write-Host "Location: $shortcutPath" -ForegroundColor White
Write-Host "You can now launch Aion OS from your desktop." -ForegroundColor White
Write-Host ""
