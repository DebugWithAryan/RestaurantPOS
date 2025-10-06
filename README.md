# RestaurantSaaS - Smart Dining Experience

A comprehensive restaurant ordering system built with Next.js 14, featuring QR code scanning, real-time collaboration, and seamless payment integration.

## 🚀 Features

### Customer Features
- **QR Code Scanning**: Scan unique table QR codes to access live menus
- **Real-time Collaboration**: Multiple people can add items to the same cart simultaneously
- **Quick Add Buttons**: Floating quick-add options for common items (roti, rice, beverages)
- **Smart Recommendations**: Quantity recommendations based on party size
- **Multiple Payment Options**: UPI, cards, cash, and split billing support
- **PWA Support**: Works offline with smart caching and app-like experience
- **Feedback System**: Built-in loyalty points and feedback collection

### Admin Features
- **Live Dashboard**: Real-time table status, orders, and revenue tracking
- **Menu Management**: Dynamic menu with categories, variants, and add-ons
- **Order Management**: Live order tracking and kitchen management
- **Payment Processing**: Multiple payment modes with automatic receipt generation
- **Analytics & Reporting**: Comprehensive reports with monthly PDF exports
- **Staff Management**: Role-based access control and audit logs

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Framer Motion
- **Database**: PostgreSQL with Prisma ORM
- **Real-time**: Socket.io for live updates
- **Authentication**: NextAuth.js
- **Payments**: Razorpay integration
- **File Storage**: Cloudinary for image management
- **PWA**: Service Workers, Offline caching

## 📱 PWA Features

- **Offline Support**: Works without internet connection
- **Smart Caching**: 30-minute TTL with automatic refresh
- **App-like Experience**: Installable on mobile devices
- **Push Notifications**: Order and payment notifications
- **Background Sync**: Syncs data when connection is restored

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- PostgreSQL database
- Redis (for caching and sessions)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/restaurant-saas.git
   cd restaurant-saas
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp env.example .env.local
   ```
   
   Fill in your environment variables:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/restaurant_saas"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key"
   JWT_SECRET="your-jwt-secret"
   RAZORPAY_KEY_ID="your-razorpay-key"
   RAZORPAY_KEY_SECRET="your-razorpay-secret"
   CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
   CLOUDINARY_API_KEY="your-cloudinary-key"
   CLOUDINARY_API_SECRET="your-cloudinary-secret"
   ```

4. **Set up the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── app/                    # Next.js 14 App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── cart/              # Shopping cart page
│   ├── feedback/          # Customer feedback page
│   ├── menu/              # Menu browsing page
│   ├── payment/           # Payment processing page
│   └── scan/              # QR code scanning page
├── components/            # Reusable components
│   ├── providers/         # Context providers
│   └── ui/               # UI components
├── hooks/                # Custom React hooks
├── lib/                  # Utility functions
├── types/                # TypeScript type definitions
└── styles/               # Global styles
```

## 🔧 Configuration

### Database Schema

The application uses Prisma ORM with PostgreSQL. Key models include:

- **Restaurant**: Restaurant information and settings
- **Table**: Table management with QR codes
- **Menu**: Categories, items, variants, and add-ons
- **Session**: Customer dining sessions
- **Order**: Order management and tracking
- **Payment**: Payment processing and billing
- **Feedback**: Customer feedback and ratings

### PWA Configuration

The app is configured as a Progressive Web App with:

- Service worker for offline functionality
- App manifest for installation
- Smart caching strategies
- Background sync capabilities

## 🎯 Key Features Implementation

### QR Code System
- Unique QR codes per table
- Session management and tracking
- Real-time table status updates

### Real-time Collaboration
- Socket.io for live updates
- Shared cart functionality
- Multi-user ordering support

### Payment Integration
- Multiple payment methods
- Split billing support
- Automatic receipt generation
- Payment status tracking

### Admin Dashboard
- Live order monitoring
- Table management
- Revenue analytics
- Staff management tools

## 📊 Analytics & Reporting

- Daily sales reports
- Customer feedback analytics
- Table occupancy tracking
- Payment method breakdowns
- Monthly PDF exports

## 🔒 Security Features

- JWT-based authentication
- Role-based access control
- Audit logging
- Secure payment processing
- Data encryption

## 🚀 Deployment

### Vercel Deployment

1. **Connect your repository to Vercel**
2. **Set environment variables in Vercel dashboard**
3. **Deploy automatically on push to main branch**

### Docker Deployment

```bash
docker build -t restaurant-saas .
docker run -p 3000:3000 restaurant-saas
```

## 📱 Mobile Optimization

- Responsive design for all screen sizes
- Touch-optimized interface
- Fast loading with image optimization
- Offline-first approach

## 🔄 Real-time Features

- Live order updates
- Real-time cart synchronization
- Instant payment notifications
- Live table status updates

## 📈 Performance

- Server-side rendering with Next.js
- Image optimization with Next.js Image
- Code splitting and lazy loading
- Efficient caching strategies

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, email support@restaurantsaas.com or join our Discord community.

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- Prisma for the excellent ORM
- All contributors who helped build this project

---

**Built with ❤️ for the restaurant industry**
