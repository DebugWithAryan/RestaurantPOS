#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🚀 Setting up RestaurantSaaS...\n');

// Check if .env.local exists
const envPath = path.join(process.cwd(), '.env.local');
if (!fs.existsSync(envPath)) {
  console.log('📝 Creating .env.local file...');
  const envContent = `# Database
DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_saas?schema=public"

# NextAuth.js
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="${generateRandomString(32)}"

# JWT
JWT_SECRET="${generateRandomString(32)}"

# Payment Gateway (Razorpay example)
RAZORPAY_KEY_ID="your-razorpay-key-id"
RAZORPAY_KEY_SECRET="your-razorpay-key-secret"

# SMS Service (Twilio example)
TWILIO_ACCOUNT_SID="your-twilio-account-sid"
TWILIO_AUTH_TOKEN="your-twilio-auth-token"
TWILIO_PHONE_NUMBER="your-twilio-phone-number"

# WhatsApp Business API (Twilio example)
WHATSAPP_ACCOUNT_SID="your-whatsapp-account-sid"
WHATSAPP_AUTH_TOKEN="your-whatsapp-auth-token"
WHATSAPP_PHONE_NUMBER="your-whatsapp-phone-number"

# Email Service (Resend example)
RESEND_API_KEY="your-resend-api-key"
FROM_EMAIL="noreply@restaurantsaas.com"

# File Storage (Cloudinary example)
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Redis (for caching and sessions)
REDIS_URL="redis://localhost:6379"

# Socket.io
SOCKET_SECRET="${generateRandomString(32)}"

# App Configuration
APP_URL="http://localhost:3000"
APP_NAME="RestaurantSaaS"
APP_DESCRIPTION="Smart Restaurant Ordering System"

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_PWA=true
ENABLE_OFFLINE_MODE=true

# Cache Configuration
CACHE_TTL=1800 # 30 minutes in seconds
MENU_CACHE_TTL=600 # 10 minutes in seconds

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000 # 15 minutes in milliseconds

# Security
BCRYPT_ROUNDS=12
SESSION_TIMEOUT=86400000 # 24 hours in milliseconds

# Development
NODE_ENV="development"
DEBUG=true
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('✅ .env.local file created successfully!\n');
} else {
  console.log('✅ .env.local file already exists\n');
}

// Install dependencies
console.log('📦 Installing dependencies...');
try {
  execSync('npm install', { stdio: 'inherit' });
  console.log('✅ Dependencies installed successfully!\n');
} catch (error) {
  console.error('❌ Failed to install dependencies:', error.message);
  process.exit(1);
}

// Generate Prisma client
console.log('🔧 Generating Prisma client...');
try {
  execSync('npx prisma generate', { stdio: 'inherit' });
  console.log('✅ Prisma client generated successfully!\n');
} catch (error) {
  console.error('❌ Failed to generate Prisma client:', error.message);
  process.exit(1);
}

// Create public directories
console.log('📁 Creating public directories...');
const publicDirs = ['icons', 'screenshots'];
publicDirs.forEach(dir => {
  const dirPath = path.join(process.cwd(), 'public', dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`✅ Created public/${dir} directory`);
  }
});

console.log('\n🎉 Setup completed successfully!\n');

console.log('📋 Next steps:');
console.log('1. Set up your PostgreSQL database');
console.log('2. Update the DATABASE_URL in .env.local');
console.log('3. Run: npx prisma db push');
console.log('4. Run: npm run dev');
console.log('5. Open http://localhost:3000\n');

console.log('📚 Documentation:');
console.log('- README.md - Complete setup guide');
console.log('- /docs - API documentation');
console.log('- /admin - Admin dashboard at /admin/dashboard\n');

console.log('🔗 Useful commands:');
console.log('- npm run dev - Start development server');
console.log('- npm run build - Build for production');
console.log('- npm run start - Start production server');
console.log('- npx prisma studio - Open database GUI');
console.log('- npx prisma db push - Push schema changes to database\n');

function generateRandomString(length) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}
