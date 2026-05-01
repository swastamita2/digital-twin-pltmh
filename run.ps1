Write-Host "Starting Digital Twin PLTMH System..." -ForegroundColor Cyan

# Start Backend
Write-Host "Starting Flask Backend on port 5000..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "powershell.exe" -ArgumentList "-Command", "cd backend ; .\venv\Scripts\python.exe app.py"

# Start Frontend
Write-Host "Starting Next.js Frontend on port 3000..." -ForegroundColor Yellow
Start-Process -NoNewWindow -FilePath "powershell.exe" -ArgumentList "-Command", "cd frontend ; npm run dev"

Write-Host "Both services are starting." -ForegroundColor Green
Write-Host "Access the dashboard at http://localhost:3000" -ForegroundColor White
Write-Host "Press Ctrl+C to stop the terminal output, but services will remain running in background." -ForegroundColor Gray
