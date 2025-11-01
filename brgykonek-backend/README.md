# BrgyKonek Backend

A TypeScript backend application built with Express.js, Mongoose, and MongoDB, featuring JWT authentication and comprehensive Swagger documentation.

## Features

- **TypeScript**: Full TypeScript support with strict type checking
- **Express.js**: Fast, unopinionated web framework
- **MongoDB & Mongoose**: NoSQL database with ODM
- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: Bcrypt for secure password storage
- **Input Validation**: Express-validator for request validation
- **Swagger Documentation**: Interactive API documentation
- **Security**: Helmet, CORS, and rate limiting
- **Environment Configuration**: Dotenv for environment variables

## Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd brgykonek-backend
```

2. Install dependencies:

```bash
npm install
```

3. Create environment file:

```bash
cp env.example .env
```

4. Configure environment variables in `.env`:

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/brgykonek
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

## Environment Setup

Copy the environment file and configure your variables:

```bash
cp env.example .env
```

Update the `.env` file with your configuration:

```env
NODE_ENV=development
PORT=3000
MONGO_URI=mongodb://localhost:27017/brgykonek
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
```

## Database Migrations

Before running the application, you need to run database migrations to set up the database schema and indexes:

```bash
npm run migrate
```

To rollback migrations (if needed):

```bash
npm run migrate:rollback
```

## Running the Application

### Development Mode

```bash
npm run dev
```

### Production Mode

```bash
npm run build
npm start
```

## API Documentation

Once the server is running, you can access the Swagger documentation at:

```
http://localhost:3000/docs
```

## API Endpoints

The following endpoints are available. For detailed request/response schemas and descriptions, please refer to the Swagger documentation at `/docs`.

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/my-profile`

## User Types

- **resident**: Regular residents
- **staff**: Barangay staff members
- **admin**: Administrative users

## Validation Rules

- **First Name**: Required, max 50 characters
- **Last Name**: Required, max 50 characters
- **Middle Name**: Optional, max 50 characters
- **Email**: Required, valid email format, unique
- **Password**: Required, minimum 6 characters
- **Mobile Number**: Required, valid Philippine mobile number format
- **User Type**: Required, must be one of: resident, staff, admin

## Security Features

- **Password Hashing**: Bcrypt with salt rounds of 12
- **JWT Tokens**: Signed with secret key from environment variables
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **CORS**: Cross-origin resource sharing enabled
- **Helmet**: Security headers
- **Input Validation**: Request validation using express-validator

## Project Structure

```
src/
├── config/
│   ├── database.ts      # MongoDB connection
│   └── swagger.ts       # Swagger configuration
├── controllers/
│   └── authController.ts # Authentication logic
├── middleware/
│   └── auth.ts          # JWT authentication middleware
├── models/
│   └── User.ts          # User model with Mongoose schema
├── routes/
│   └── auth.ts          # Authentication routes
├── utils/
│   └── validation.ts    # Validation utilities
└── index.ts             # Main application entry point
```

## Testing

```bash
npm test
```

## License

MIT

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build the application for production
- `npm start` - Start production server
- `npm test` - Run tests
- `npm run migrate` - Run database migrations
- `npm run migrate:rollback` - Rollback database migrations
