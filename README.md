# Premium Store - E-commerce Platform

Premium Account & IndoSMM Services E-commerce Platform built with Next.js 14, TypeScript, MySQL, and Tailwind CSS.

## 🚀 Features

### User Features
- **Premium Account Store**: Netflix, Spotify, Disney+, etc.
- **IndoSMM Services**: Instagram, TikTok, YouTube services
- **Role-based Pricing**: Different prices for users and resellers
- **Order History**: Complete purchase history with account details
- **Real-time Status**: Live order tracking and updates

### Admin Features
- **Dashboard**: Revenue analytics and key metrics
- **Product Management**: CRUD operations for premium accounts
- **Service Management**: IndoSMM service synchronization
- **Order Management**: Complete order processing system
- **Account Inventory**: Bulk account management with CSV upload
- **Category Management**: Product categorization system
- **Reports & Analytics**: Comprehensive business insights

### Technical Features
- **Authentication**: JWT-based auth with role management
- **Payment Gateway**: Xendit integration with webhooks
- **API Integration**: IndoSMM API for service management
- **File Upload**: Image and CSV file handling
- **Responsive Design**: Mobile-first approach
- **Error Handling**: Comprehensive error pages and states

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 18, TypeScript
- **Styling**: Tailwind CSS, Radix UI Components
- **Backend**: Next.js API Routes, MySQL
- **Authentication**: JWT, bcryptjs
- **Payment**: Xendit Payment Gateway
- **File Upload**: Multer, Sharp for image processing
- **Charts**: Recharts for analytics
- **Forms**: React Hook Form with Zod validation

## 📋 Prerequisites

- Node.js 18+ 
- MySQL 8.0+
- npm or yarn
- Xendit Account (for payments)
- IndoSMM API Access (for services)

## 🚀 Installation

### 1. Clone Repository
\`\`\`bash
git clone <repository-url>
cd premium-store
\`\`\`

### 2. Install Dependencies
\`\`\`bash
npm install
# or
yarn install
\`\`\`

### 3. Environment Setup
\`\`\`bash
cp .env.example .env.local
\`\`\`

Edit `.env.local` with your configuration:
- Database credentials
- JWT secret key
- Xendit API keys
- IndoSMM API credentials
- SMTP settings (optional)

### 4. Database Setup
\`\`\`bash
# Create database
mysql -u root -p
CREATE DATABASE premium_store;

# Run migrations
npm run db:migrate

# Seed initial data
npm run db:seed
\`\`\`

### 5. Run Development Server
\`\`\`bash
npm run dev
\`\`\`

Visit `http://localhost:3000`

## 📁 Project Structure

\`\`\`
premium-store/
├── app/                    # Next.js 14 App Router
│   ├── admin/             # Admin dashboard pages
│   ├── api/               # API routes
│   ├── auth/              # Authentication pages
│   ├── payment/           # Payment status pages
│   ├── products/          # Product pages
│   └── services/          # IndoSMM service pages
├── components/            # Reusable components
│   ├── admin/            # Admin-specific components
│   ├── ui/               # UI components (shadcn/ui)
│   └── ...               # Other components
├── lib/                  # Utility libraries
│   ├── auth.ts           # Authentication utilities
│   ├── db.ts             # Database connection
│   ├── xendit.ts         # Payment integration
│   └── indosmm.ts        # IndoSMM API integration
├── scripts/              # Database scripts
│   ├── 001-create-database.sql
│   ├── 002-seed-data.sql
│   └── 003-add-featured-column.sql
├── middleware.ts         # Next.js middleware
└── ...
\`\`\`

## 🔐 Authentication & Authorization

### User Roles
- **user**: Regular customers
- **reseller**: Customers with discounted pricing
- **admin**: Full system access

### Protected Routes
- `/admin/*` - Admin only
- `/history` - Authenticated users
- `/profile` - Authenticated users

### JWT Token Structure
\`\`\`json
{
  "userId": 1,
  "email": "user@example.com",
  "role": "user",
  "iat": 1234567890,
  "exp": 1234567890
}
\`\`\`

## 💳 Payment Integration

### Xendit Setup
1. Create Xendit account
2. Get API keys from dashboard
3. Set webhook URL: `https://yourdomain.com/api/webhooks/xendit`
4. Configure webhook events: `invoice.paid`, `invoice.expired`

### Payment Flow
1. User creates order
2. System creates Xendit invoice
3. User redirected to payment page
4. Webhook updates order status
5. Account delivered on success

## 🔌 IndoSMM Integration

### API Endpoints Used
- `GET /services` - Fetch available services
- `POST /order` - Create new order
- `GET /status` - Check order status

### Service Synchronization
- Admin can sync services from IndoSMM
- Automatic price calculation (20% markup for users, 10% for resellers)
- Real-time status updates

## 📊 Database Schema

### Core Tables
- `users` - User accounts and authentication
- `categories` - Product categories
- `products` - Premium account products
- `premium_accounts` - Account inventory
- `indosmm_services` - Available IndoSMM services
- `orders` - Order management
- `order_items` - Order line items
- `order_indosmm_items` - IndoSMM order items

### Key Relationships
- Users have many Orders
- Orders have many Order Items
- Products belong to Categories
- Products have many Premium Accounts

## 🚀 Deployment

### Production Build
\`\`\`bash
npm run build
npm start
\`\`\`

### Environment Variables
Ensure all production environment variables are set:
- Database connection
- JWT secret (use strong random key)
- Xendit production keys
- SMTP configuration

### Database Migration
\`\`\`bash
# Production database setup
mysql -u root -p
CREATE DATABASE premium_store_prod;

# Run all migration scripts in order
mysql -u root -p premium_store_prod < scripts/001-create-database.sql
mysql -u root -p premium_store_prod < scripts/002-seed-data.sql
mysql -u root -p premium_store_prod < scripts/003-add-featured-column.sql
\`\`\`

## 🔧 Configuration

### Default Admin Account
- Email: `admin@example.com`
- Password: `admin123`
- Role: `admin`

**⚠️ Change default admin credentials in production!**

### File Upload Limits
- Max file size: 5MB
- Allowed types: JPEG, PNG, WebP, CSV
- Upload directory: `public/uploads/`

### Rate Limiting
- API routes: 100 requests per minute per IP
- File uploads: 10 uploads per minute per user

## 🐛 Troubleshooting

### Common Issues

#### Database Connection Error
\`\`\`bash
Error: connect ECONNREFUSED 127.0.0.1:3306
\`\`\`
**Solution**: Check MySQL service and credentials

#### JWT Token Invalid
\`\`\`bash
Error: JsonWebTokenError: invalid token
\`\`\`
**Solution**: Check JWT_SECRET in environment variables

#### Xendit Webhook Failed
\`\`\`bash
Error: Webhook signature verification failed
\`\`\`
**Solution**: Verify XENDIT_WEBHOOK_TOKEN configuration

#### File Upload Error
\`\`\`bash
Error: File too large
\`\`\`
**Solution**: Check UPLOAD_MAX_SIZE setting

### Debug Mode
Set `NODE_ENV=development` for detailed error messages and logging.

## 📝 API Documentation

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout
- `GET /api/auth/me` - Get current user

### Product Endpoints
- `GET /api/products` - List products
- `GET /api/products/[id]` - Get product details
- `POST /api/products` - Create product (admin)
- `PUT /api/products/[id]` - Update product (admin)
- `DELETE /api/products/[id]` - Delete product (admin)

### Order Endpoints
- `GET /api/orders` - List user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[orderNumber]` - Get order details

### Admin Endpoints
- `GET /api/admin/dashboard` - Dashboard statistics
- `GET /api/admin/orders` - All orders management
- `GET /api/admin/reports` - Analytics and reports

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact: support@premiumstore.com
- Documentation: [Wiki](link-to-wiki)

## 🔄 Changelog

### v1.0.0 (Current)
- Initial release
- Complete e-commerce functionality
- Admin dashboard
- Payment integration
- IndoSMM services

---

**Built with ❤️ using Next.js and TypeScript**
\`\`\`
