# Test API Script for PowerShell
# Usage: .\test-api.ps1

$baseUrl = "http://localhost:5001"

Write-Host "🧪 Testing API Endpoints..." -ForegroundColor Yellow
Write-Host "================================"
Write-Host ""

# Test 1: Health Check
Write-Host "1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/health" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ Health Check: OK" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ Health Check: Failed" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
Write-Host ""

# Test 2: Get All Users
Write-Host "2. Testing GET /api/users..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/users" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ GET /api/users: OK" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   Found $($content.Count) users"
    }
} catch {
    Write-Host "❌ GET /api/users: Failed" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
Write-Host ""

# Test 3: Register User
Write-Host "3. Testing POST /api/auth/register..." -ForegroundColor Yellow
$timestamp = [DateTimeOffset]::Now.ToUnixTimeSeconds()
$registerData = @{
    fullName = "Test User"
    email = "test$timestamp@usth.edu.vn"
    password = "test123456"
    role = "ASSISTANT"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/register" `
        -Method POST `
        -ContentType "application/json" `
        -Body $registerData `
        -UseBasicParsing
    if ($response.StatusCode -eq 201) {
        Write-Host "✅ POST /api/auth/register: OK" -ForegroundColor Green
        $userData = $response.Content | ConvertFrom-Json
        Write-Host "   Created user: $($userData.user.email)"
    }
} catch {
    Write-Host "❌ POST /api/auth/register: Failed" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
Write-Host ""

# Test 4: Login
Write-Host "4. Testing POST /api/auth/login..." -ForegroundColor Yellow
$loginData = @{
    email = "test@usth.edu.vn"
    password = "test123456"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/auth/login" `
        -Method POST `
        -ContentType "application/json" `
        -Body $loginData `
        -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ POST /api/auth/login: OK" -ForegroundColor Green
        $userData = $response.Content | ConvertFrom-Json
        Write-Host "   Logged in as: $($userData.user.email) ($($userData.user.role))"
    }
} catch {
    Write-Host "❌ POST /api/auth/login: Failed" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
Write-Host ""

# Test 5: Get Subjects
Write-Host "5. Testing GET /api/subjects..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/subjects" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ GET /api/subjects: OK" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   Found $($content.Count) subjects"
    }
} catch {
    Write-Host "❌ GET /api/subjects: Failed" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
Write-Host ""

# Test 6: Get Rooms
Write-Host "6. Testing GET /api/rooms..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$baseUrl/api/rooms" -Method GET -UseBasicParsing
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ GET /api/rooms: OK" -ForegroundColor Green
        $content = $response.Content | ConvertFrom-Json
        Write-Host "   Found $($content.Count) rooms"
    }
} catch {
    Write-Host "❌ GET /api/rooms: Failed" -ForegroundColor Red
    Write-Host $_.Exception.Message
}
Write-Host ""

Write-Host "================================"
Write-Host "✅ Testing completed!" -ForegroundColor Green

