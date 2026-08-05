# Run as Administrator: right-click -> Run with PowerShell (Admin)
# Allows your phone (same Wi-Fi) to reach Eventra on ports 4200 and 5000

$ErrorActionPreference = "Stop"

Write-Host "Adding Windows Firewall rules for Eventra..." -ForegroundColor Cyan

netsh advfirewall firewall delete rule name="Eventra Frontend 4200" 2>$null
netsh advfirewall firewall delete rule name="Eventra Backend 5000" 2>$null

netsh advfirewall firewall add rule name="Eventra Frontend 4200" dir=in action=allow protocol=TCP localport=4200 profile=private,domain
netsh advfirewall firewall add rule name="Eventra Backend 5000" dir=in action=allow protocol=TCP localport=5000 profile=private,domain

$ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object {
    $_.IPAddress -like "192.168.*" -or $_.IPAddress -like "10.*"
} | Select-Object -First 1).IPAddress

Write-Host ""
Write-Host "Done. On your phone (same Wi-Fi), open:" -ForegroundColor Green
if ($ip) {
    Write-Host "  http://${ip}:4200" -ForegroundColor Yellow
} else {
    Write-Host "  http://YOUR-PC-IP:4200  (run ipconfig to find IPv4)" -ForegroundColor Yellow
}
Write-Host ""
Write-Host "Keep npm run dev running on your PC." -ForegroundColor DarkGray
