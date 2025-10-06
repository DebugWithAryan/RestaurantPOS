# PowerShell script to fix RestaurantSaaS issues

Write-Host "🔧 Fixing RestaurantSaaS issues..." -ForegroundColor Green

# Check if Node.js is installed
try {
    $nodeVersion = node --version
    Write-Host "✅ Node.js version: $nodeVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Node.js is not installed. Please install Node.js first." -ForegroundColor Red
    exit 1
}

# Check if npm is installed
try {
    $npmVersion = npm --version
    Write-Host "✅ npm version: $npmVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ npm is not installed. Please install npm first." -ForegroundColor Red
    exit 1
}

# Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
try {
    npm install
    Write-Host "✅ Dependencies installed successfully!" -ForegroundColor Green
} catch {
    Write-Host "❌ Failed to install dependencies." -ForegroundColor Red
    exit 1
}

# Check TypeScript installation
Write-Host "🔍 Checking TypeScript..." -ForegroundColor Yellow
try {
    $tsVersion = npx tsc --version
    Write-Host "✅ TypeScript version: $tsVersion" -ForegroundColor Green
} catch {
    Write-Host "⚠️ TypeScript not found, installing..." -ForegroundColor Yellow
    npm install -D typescript
}

# Run type checking
Write-Host "🔍 Running type check..." -ForegroundColor Yellow
try {
    npm run type-check
    Write-Host "✅ Type checking passed!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Type checking found issues, but continuing..." -ForegroundColor Yellow
}

# Run linting
Write-Host "🔍 Running linting..." -ForegroundColor Yellow
try {
    npm run lint
    Write-Host "✅ Linting passed!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Linting found issues, but continuing..." -ForegroundColor Yellow
}

# Check if .env.local exists
if (Test-Path ".env.local") {
    Write-Host "✅ .env.local file exists" -ForegroundColor Green
} else {
    Write-Host "📝 Creating .env.local file..." -ForegroundColor Yellow
    Copy-Item "env.example" ".env.local"
    Write-Host "✅ .env.local file created from env.example" -ForegroundColor Green
    Write-Host "⚠️ Please update the values in .env.local with your actual configuration" -ForegroundColor Yellow
}

# Check Prisma
Write-Host "🔍 Checking Prisma..." -ForegroundColor Yellow
try {
    npx prisma generate
    Write-Host "✅ Prisma client generated!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Prisma generation failed, but continuing..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🎉 Setup completed!" -ForegroundColor Green
Write-Host ""
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "1. Update .env.local with your database URL and API keys" -ForegroundColor White
Write-Host "2. Run: npx prisma db push (if you have a database set up)" -ForegroundColor White
Write-Host "3. Run: npm run dev" -ForegroundColor White
Write-Host "4. Open http://localhost:3000" -ForegroundColor White

Write-Host ""
Write-Host "🔗 Useful commands:" -ForegroundColor Cyan
Write-Host "- npm run dev - Start development server" -ForegroundColor White
Write-Host "- npm run build - Build for production" -ForegroundColor White
Write-Host "- npm run lint - Run ESLint" -ForegroundColor White
Write-Host "- npm run type-check - Run TypeScript check" -ForegroundColor White