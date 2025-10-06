# RestaurantSaaS Deployment Guide

This guide covers deploying the RestaurantSaaS application to various platforms.

## 🚀 Quick Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account
- PostgreSQL database (Vercel Postgres, Supabase, or Railway)

### Steps

1. **Fork the repository**
   ```bash
   # Fork this repository to your GitHub account
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your forked repository

3. **Configure Environment Variables**
   Add these environment variables in Vercel dashboard:
   ```
   DATABASE_URL=your_postgresql_connection_string
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your_secret_key
   JWT_SECRET=your_jwt_secret
   RAZORPAY_KEY_ID=your_razorpay_key
   RAZORPAY_KEY_SECRET=your_razorpay_secret
   CLOUDINARY_CLOUD_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_cloudinary_key
   CLOUDINARY_API_SECRET=your_cloudinary_secret
   ```

4. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete

5. **Set up Database**
   ```bash
   # Install Vercel CLI
   npm i -g vercel
   
   # Run Prisma migrations
   vercel env pull .env.local
   npx prisma db push
   ```

## 🐳 Docker Deployment

### Build Docker Image
```bash
# Build the image
docker build -t restaurant-saas .

# Run the container
docker run -p 3000:3000 \
  -e DATABASE_URL="your_database_url" \
  -e NEXTAUTH_SECRET="your_secret" \
  restaurant-saas
```

### Docker Compose
```yaml
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - DATABASE_URL=postgresql://postgres:password@db:5432/restaurant_saas
      - NEXTAUTH_SECRET=your_secret
      - NEXTAUTH_URL=http://localhost:3000
    depends_on:
      - db
      - redis
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=restaurant_saas
      - POSTGRES_USER=postgres
      - POSTGRES_PASSWORD=password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
  
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"

volumes:
  postgres_data:
```

## ☁️ AWS Deployment

### Using AWS Amplify
1. Connect your GitHub repository to Amplify
2. Configure build settings:
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - npm install
           - npx prisma generate
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: .next
       files:
         - '**/*'
   ```

### Using AWS ECS
1. Create ECS cluster
2. Create task definition with your Docker image
3. Set up Application Load Balancer
4. Configure environment variables
5. Deploy service

## 🐙 Railway Deployment

1. **Connect Repository**
   - Go to [railway.app](https://railway.app)
   - Connect your GitHub repository

2. **Add Services**
   - PostgreSQL database
   - Redis (optional)

3. **Configure Environment**
   ```bash
   DATABASE_URL=${{Postgres.DATABASE_URL}}
   REDIS_URL=${{Redis.REDIS_URL}}
   NEXTAUTH_URL=https://your-app.railway.app
   ```

4. **Deploy**
   - Railway will automatically deploy on push

## 🐳 DigitalOcean App Platform

1. **Create App**
   - Connect your GitHub repository
   - Choose "Web Service"

2. **Configure Build**
   ```yaml
   build_command: npm run build
   run_command: npm start
   ```

3. **Add Database**
   - Add PostgreSQL managed database
   - Configure connection string

4. **Deploy**
   - Click "Create Resources"

## 🔧 Environment Variables

### Required Variables
```bash
DATABASE_URL=postgresql://user:password@host:port/database
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
JWT_SECRET=your-jwt-secret
```

### Optional Variables
```bash
# Payment Gateway
RAZORPAY_KEY_ID=your_razorpay_key
RAZORPAY_KEY_SECRET=your_razorpay_secret

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Service
RESEND_API_KEY=your_resend_key
FROM_EMAIL=noreply@yourdomain.com

# SMS Service
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_PHONE_NUMBER=your_twilio_number

# Redis (for caching)
REDIS_URL=redis://host:port

# Feature Flags
ENABLE_ANALYTICS=true
ENABLE_PWA=true
ENABLE_OFFLINE_MODE=true
```

## 📊 Database Setup

### PostgreSQL
1. Create database
2. Run migrations:
   ```bash
   npx prisma db push
   ```
3. Seed data (optional):
   ```bash
   npx prisma db seed
   ```

### Database Providers
- **Vercel Postgres** - Integrated with Vercel
- **Supabase** - Free tier available
- **Railway** - PostgreSQL included
- **AWS RDS** - Production ready
- **DigitalOcean** - Managed databases

## 🔒 Security Considerations

### Production Checklist
- [ ] Use HTTPS everywhere
- [ ] Set secure environment variables
- [ ] Enable database SSL
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Enable audit logging
- [ ] Use secure session storage
- [ ] Implement proper error handling

### SSL/TLS
```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          }
        ]
      }
    ];
  }
};
```

## 📈 Performance Optimization

### Next.js Optimizations
```javascript
// next.config.js
module.exports = {
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
  images: {
    domains: ['your-cloudinary-domain.com'],
    formats: ['image/webp', 'image/avif'],
  },
  experimental: {
    optimizeCss: true,
    optimizePackageImports: ['lucide-react'],
  },
};
```

### CDN Configuration
- Use Vercel Edge Network
- Configure CloudFront (AWS)
- Set up proper caching headers
- Enable gzip compression

## 🔄 CI/CD Pipeline

### GitHub Actions
```yaml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - run: npm run test
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📱 PWA Deployment

### Service Worker
- Automatically registered in production
- Caches static assets
- Enables offline functionality

### Manifest
- Configured for installability
- Custom icons required
- Set up in `/public/manifest.json`

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Error**
   ```bash
   # Check connection string
   echo $DATABASE_URL
   
   # Test connection
   npx prisma db pull
   ```

2. **Build Failures**
   ```bash
   # Clear cache
   rm -rf .next
   npm run build
   ```

3. **Environment Variables**
   ```bash
   # Check variables
   vercel env ls
   
   # Pull variables
   vercel env pull .env.local
   ```

4. **Prisma Issues**
   ```bash
   # Reset database
   npx prisma db push --force-reset
   
   # Generate client
   npx prisma generate
   ```

## 📞 Support

- **Documentation**: README.md
- **Issues**: GitHub Issues
- **Discord**: Join our community
- **Email**: support@restaurantsaas.com

## 🎯 Post-Deployment

1. **Set up monitoring**
   - Vercel Analytics
   - Sentry for error tracking
   - Uptime monitoring

2. **Configure domains**
   - Custom domain setup
   - SSL certificate
   - DNS configuration

3. **Backup strategy**
   - Database backups
   - File storage backups
   - Configuration backups

4. **Scaling considerations**
   - Database connection pooling
   - CDN setup
   - Load balancing
   - Caching strategies
