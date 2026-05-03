Write-Host "=========================================" -ForegroundColor Cyan
Write-Host " Starting Digital Twin PLTMH System" -ForegroundColor Cyan
Write-Host "=========================================" -ForegroundColor Cyan

# Check and Setup Backend
Write-Host "Checking Backend environment..." -ForegroundColor Yellow
Set-Location -Path "backend"
if (!(Test-Path -Path "venv")) {
    Write-Host "Virtual environment not found. Creating venv..." -ForegroundColor Magenta
    python -m venv venv
    Write-Host "Installing Python dependencies..." -ForegroundColor Magenta
    .\venv\Scripts\pip install -r requirements.txt
}
Set-Location -Path ".."

# Check and Setup Frontend
Write-Host "Checking Frontend environment..." -ForegroundColor Yellow
Set-Location -Path "frontend"
if (!(Test-Path -Path "node_modules")) {
    Write-Host "Node modules not found. Installing npm dependencies..." -ForegroundColor Magenta
    npm install
}
Set-Location -Path ".."

# Start Backend
Write-Host "Starting Flask Backend on port 5000..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "powershell.exe" -ArgumentList "-Command", "Set-Location -Path 'backend' ; .\venv\Scripts\python.exe app.py"

# Start Frontend
Write-Host "Starting Next.js Frontend on port 3000..." -ForegroundColor Green
Start-Process -NoNewWindow -FilePath "powershell.exe" -ArgumentList "-Command", "Set-Location -Path 'frontend' ; npm run dev"

Write-Host "=========================================" -ForegroundColor Cyan
Write-Host "Services started!" -ForegroundColor Green
Write-Host "Dashboard   : http://localhost:3000" -ForegroundColor White
Write-Host "Backend API : http://localhost:5000" -ForegroundColor White
Write-Host "Press Ctrl+C to stop the terminal output, but services will remain running in background." -ForegroundColor Gray
Write-Host "=========================================" -ForegroundColor Cyan
