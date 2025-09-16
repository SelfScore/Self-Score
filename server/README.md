# LifeScore Backend Server

A separate backend server for the LifeScore application built with Node.js, Express, TypeScript, and MongoDB.

## Features

- **Authentication System**: Complete user authentication with email verification
- **TypeScript**: Full TypeScript support with strict type checking
- **MongoDB**: Database integration with Mongoose ODM
- **Input Validation**: Request validation using Zod schemas
- **Error Handling**: Centralized error handling and logging
- **CORS Support**: Cross-origin resource sharing configuration
- **Environment Configuration**: Environment-based configuration

## Project Structure

```
server/
├── src/
│   ├── controllers/        # Route controllers
│   ├── lib/               # Database connection and utilities
│   ├── middleware/        # Express middleware
│   ├── models/           # Mongoose models
│   ├── routes/           # API routes
│   ├── schemas/          # Zod validation schemas
│   ├── types/            # TypeScript type definitions
│   └── index.ts          # Main server file
├── dist/                 # Compiled JavaScript (after build)
├── .env                  # Environment variables
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
```

## API Endpoints

### Authentication Routes

- `POST /api/auth/sign-up` - Register a new user
- `POST /api/auth/login` - User login
- `POST /api/auth/verify-email` - Verify email with code
- `POST /api/auth/resend-verification` - Resend verification code

### Utility Routes

- `GET /` - API information and available endpoints
- `GET /api/health` - Health check endpoint

## Setup and Installation

1. **Install Dependencies**

   ```bash
   npm install
   ```

2. **Environment Configuration**
   Update the `.env` file with your configurations:

   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/lifescore
   CLIENT_URL=http://localhost:3000
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRE=7d
   ```

3. **Development Server**

   ```bash
   npm run dev
   ```

4. **Production Build**
   ```bash
   npm run build
   npm start
   ```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

## API Request/Response Examples

### Sign Up

```json
POST /api/auth/sign-up
{
  "username": "john_doe",
  "email": "john@example.com",
  "phoneNumber": "1234567890",
  "password": "password123",
  "confirmPassword": "password123"
}
```

### Login

```json
POST /api/auth/login
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Verify Email

```json
POST /api/auth/verify-email
{
  "email": "john@example.com",
  "verifyCode": "123456"
}
```

## Response Format

All API responses follow this format:

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data
  }
}
```

Error responses:

```json
{
  "success": false,
  "message": "Error message",
  "errors": [
    // Validation errors if any
  ]
}
```

## Database Schema

### User Model

```typescript
{
  username: string;
  email: string;
  password: string;
  phoneNumber: string;
  verifyCode: string;
  verifyCodeExpiry: Date;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

## Technologies Used

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **TypeScript** - Type-safe JavaScript
- **MongoDB** - Database
- **Mongoose** - MongoDB ODM
- **bcryptjs** - Password hashing
- **Zod** - Schema validation
- **CORS** - Cross-origin resource sharing
- **dotenv** - Environment variables
- **nodemon** - Development server
- **ts-node** - TypeScript execution

## Future Enhancements

- JWT authentication
- Email service integration
- Rate limiting
- API documentation with Swagger
- Unit and integration tests
- Logging service
- Docker containerization
