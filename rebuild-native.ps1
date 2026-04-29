# Rebuild native modules for Electron
Write-Host "Rebuilding native modules for Electron..." -ForegroundColor Cyan

# Install @electron/rebuild (newer version)
Write-Host "Installing @electron/rebuild..." -ForegroundColor Yellow
npm install --save-dev @electron/rebuild

# Rebuild native modules
Write-Host "Rebuilding better-sqlite3, keytar, and node-pty..." -ForegroundColor Yellow
npx @electron/rebuild -f -w better-sqlite3 -w keytar -w node-pty

Write-Host "Rebuild complete!" -ForegroundColor Green
Write-Host "You can now run: npm start" -ForegroundColor Green
