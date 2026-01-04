Write-Host "🚀 Preparing to update GitHub repository..." -ForegroundColor Cyan

# 1. Initialize Git if not present
if (-not (Test-Path ".git")) {
    Write-Host "Initializing new Git repository..." -ForegroundColor Yellow
    git init
}

# 2. Add all files
Write-Host "TbStaging all files..." -ForegroundColor Yellow
git add .

# 3. Commit
Write-Host "Committing changes..." -ForegroundColor Yellow
git commit -m "Auto-update: Latest fullstack enhancements"

# 4. Configure Remote
Write-Host "Configuring remote origin..." -ForegroundColor Yellow
git branch -M main
git remote remove origin 2>$null
git remote add origin https://github.com/Rajupeace/fbnXai.git

# 5. Push
Write-Host "Pushing to GitHub (https://github.com/Rajupeace/fbnXai)..." -ForegroundColor Cyan
Write-Host "NOTE: If a login window pops up, please sign in." -ForegroundColor Magenta
git push -u origin main --force

Write-Host "`n✅ Github Update Sequence Completed!" -ForegroundColor Green
