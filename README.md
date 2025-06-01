# 🛍️ E-Commerce Platform

A robust and modern E-Commerce web application built with cutting-edge technologies. This platform provides a complete solution for online retail operations, featuring user authentication, product management, shopping cart functionality, secure payments, and more.

## 🚀 Key Features

- **🔐 User Authentication & Authorization**
  - Local authentication with email and password
  - Google OAuth integration
  - JWT-based session management
  - Role-based access control (Admin/User)

- **📦 Product Management**
  - Comprehensive product catalog
  - Category and subcategory organization
  - Image management with Cloudinary integration
  - Product search and filtering

- **🛒 Shopping Experience**
  - Interactive shopping cart
  - Secure checkout process
  - Multiple payment options via Stripe
  - Order tracking and history

- **👤 User Features**
  - Profile management
  - Address book functionality
  - Order history
  - Wishlist management

- **⚙️ Admin Dashboard**
  - Product inventory management
  - Order processing and tracking
  - User management
  - Analytics and reporting

## 💻 Technical Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: Passport.js, JWT

### Frontend
- **Template Engine**: EJS
- **Layouts**: Express-EJS-Layouts

### Storage & Services
- **Image Storage**: Cloudinary
- **Caching**: Redis
- **Payments**: Stripe
- **Email**: Nodemailer

### Development Tools
- **Build Tool**: TypeScript Compiler
- **Development Server**: Nodemon
- **Version Control**: Git
- **API Testing**: Postman (recommended)

## 🛠️ Development Setup

1. **Prerequisites**
   - Node.js (v16 or higher)
   - PostgreSQL database
   - Redis server
   - Cloudinary account
   - Stripe account

2. **Installation**
   ```bash
   # Clone the repository
   git clone <repository-url>
   
   # Install dependencies
   npm install
   
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma migrate dev
   ```

3. **Environment Configuration**
   Create a `.env` file with the following variables:
   ```env
   PORT=3000
   NODE_ENV=development
   DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
   JWT_SECRET=your_jwt_secret
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_KEY=your_cloudinary_key
   CLOUDINARY_SECRET=your_cloudinary_secret
   STRIPE_SECRET_KEY=your_stripe_secret_key
   ```

4. **Running the Application**
   ```bash
   # Development mode
   npm run dev
   
   # Production build
   npm run build
   npm start
   ```

## 📦 Project Structure

```
e-commerce/
├── src/               # Source code
├── prisma/            # Database schema and migrations
├── dist/             # Compiled TypeScript
├── node_modules/     # Dependencies
└── public/           # Static assets
```

## 🔒 Security Features

- Password hashing with bcrypt
- JWT-based authentication
- Session management
- CSRF protection
- Rate limiting
- Input validation
- Secure headers

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests.

## 📝 License

This project is licensed under the ISC License.

## 🙏 Acknowledgments

- Express.js team
- Prisma team
- TypeScript team
- All contributors and maintainers 