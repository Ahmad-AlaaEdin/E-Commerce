# 🛒 E-Commerce Platform

A modern E-Commerce web application built with Node.js, Express, TypeScript, Prisma ORM, and PostgreSQL. This project supports user authentication, product management, shopping cart, order processing, payments, and more.

---

## ✨ Features

- **User Authentication**: Register, login, JWT-based authentication, and user profile management.
- **Product Catalog**: Categories, subcategories, and products with images, descriptions, and prices.
- **Shopping Cart**: Add, update, and remove items from the cart.
- **Order Management**: Place orders, view order history, and manage order status.
- **Payment Integration**: Payment processing with Stripe + webhook support.
- **Address Management**: Save and update shipping addresses.
- **Admin Features**: Manage products, categories, and users (role-based access).
- **RESTful API**: Clean API endpoints for frontend or external apps.
- **EJS Views**: Server-side rendered pages for main site navigation.
- **Cloudinary Integration**: Image uploads and storage.
- **Prisma ORM**: Type-safe database access and migrations.
- **TypeScript**: Strong typing for clean, maintainable code.

---

## ⚙️ Tech Stack

- **Backend**: Node.js, Express.js, TypeScript
- **Database**: PostgreSQL (with Prisma ORM)
- **Authentication**: JWT
- **Templating**: EJS
- **File Uploads**: Cloudinary
- **Others**: Morgan (logging), Cookie-Parser, Slugify, Bcrypt

---

## 🚀 Getting Started

### ✅ Prerequisites

- Node.js (v16+ recommended)
- PostgreSQL
- [Cloudinary](https://cloudinary.com/) account
- Stripe account

---

### 🛠 Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/yourusername/e-commerce.git
   cd e-commerce
   ```

## 🔧 Installation Steps

### 1. Install dependencies:

```bash
npm install
```

### 2. Set up environment variables:

Create a `.env` file in the root directory and add the following:

```env
PORT=3000
NODE_ENV=development
DATABASE_URL=postgresql://user:password@localhost:5432/ecommerce
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=90d
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_KEY=your_cloudinary_key
CLOUDINARY_SECRET=your_cloudinary_secret
BREVO_HOST=your_brevo_host
BREVO_PORT=your_brevo_port
BREVO_LOGIN=your_brevo_login
BREVO_PASSWORD=your_brevo_password
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret

```

### 3. Run migrations:

```bash
npx prisma migrate dev
```

### 4. Start the server:

```bash
npm start
```

## 📊 Entity Relationship Diagram (ERD)

#### Below is a simplified view of the database structure:

![ERD](prisma/ERD.jpg)
