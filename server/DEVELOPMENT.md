# LifeScore Server Development Guide

## Quick Start

1. **Clone and Setup**

   ```bash
   cd /path/to/lifescore/server
   npm install
   ```

2. **Environment Setup**

   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

3. **Start Development Server**

   ```bash
   npm run dev
   ```

4. **Access Server**
   - Main API: http://localhost:5000
   - Health Check: http://localhost:5000/api/health

## MongoDB Setup (Optional)

The server will run without MongoDB, but to test authentication features:

1. **Install MongoDB**

   ```bash
   # macOS with Homebrew
   brew install mongodb-community

   # Start MongoDB
   brew services start mongodb-community
   ```

2. **Verify Connection**

   ```bash
   # Check if MongoDB is running
   brew services list | grep mongodb

   # Connect to MongoDB
   mongosh
   ```

3. **Update Environment**
   ```env
   MONGODB_URI=mongodb://localhost:27017/lifescore
   ```

## Testing API Endpoints

### Using curl

```bash
# Health Check
curl http://localhost:5000/api/health

# Sign Up (will fail without MongoDB)
curl -X POST http://localhost:5000/api/auth/sign-up \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "phoneNumber": "1234567890",
    "password": "password123",
    "confirmPassword": "password123"
  }'
```

### Using Postman or Similar

1. **GET** `http://localhost:5000/api/health`
2. **POST** `http://localhost:5000/api/auth/sign-up`
   - Body: JSON with user data
3. **POST** `http://localhost:5000/api/auth/login`
   - Body: JSON with email and password
4. **POST** `http://localhost:5000/api/auth/verify-email`
   - Body: JSON with email and verifyCode
5. **POST** `http://localhost:5000/api/auth/resend-verification`
   - Body: JSON with email

## Project Structure

```
server/
├── src/
│   ├── controllers/
│   │   └── authController.ts      # Authentication logic
│   ├── lib/
│   │   ├── dbConnect.ts           # Database connection
│   │   └── dbUtils.ts             # Database utilities
│   ├── middleware/
│   │   ├── errorHandler.ts        # Error handling
│   │   └── logger.ts              # Request logging
│   ├── models/
│   │   └── User.ts                # User model
│   ├── routes/
│   │   ├── auth.ts                # Auth routes
│   │   └── index.ts               # Route aggregation
│   ├── schemas/
│   │   ├── loginSchema.ts         # Login validation
│   │   ├── signUpSchema.ts        # SignUp validation
│   │   ├── verifyEmailSchema.ts   # Email verification
│   │   └── resendVerificationSchema.ts
│   ├── types/
│   │   └── api.ts                 # TypeScript types
│   └── index.ts                   # Main server file
├── dist/                          # Compiled JavaScript
├── .env                           # Environment variables
├── package.json
├── tsconfig.json
├── nodemon.json
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Compile TypeScript to JavaScript
- `npm start` - Start production server
- `npm test` - Run tests (to be implemented)

## Adding New Features

### 1. Add New Route

1. Create controller in `src/controllers/`
2. Create route in `src/routes/`
3. Add route to `src/routes/index.ts`

### 2. Add New Model

1. Create model in `src/models/`
2. Add validation schema in `src/schemas/`
3. Update types in `src/types/api.ts`

### 3. Add Middleware

1. Create middleware in `src/middleware/`
2. Add to relevant routes or app-level

## Environment Variables

```env
# Required
PORT=5000
NODE_ENV=development

# Database (Optional - server runs without it)
MONGODB_URI=mongodb://localhost:27017/lifescore

# CORS
CLIENT_URL=http://localhost:3000

# Future use
JWT_SECRET=your-jwt-secret
EMAIL_SERVICE=gmail
EMAIL_USER=your-email
EMAIL_PASS=your-password
```

## Common Issues

### Server Won't Start

- Check if port 5000 is available
- Verify Node.js version (requires Node 14+)
- Check TypeScript compilation with `npm run build`

### Database Connection Fails

- Server will continue without database
- Check MongoDB is running: `brew services list | grep mongodb`
- Verify MONGODB_URI in .env

### Authentication Endpoints Return 503

- This is expected without database connection
- Database check returns 503 status when MongoDB is unavailable

## Next Steps

1. **Add JWT Authentication**

   - Install jsonwebtoken
   - Create auth middleware
   - Add protected routes

2. **Email Service**

   - Integrate with SendGrid/Nodemailer
   - Implement email verification

3. **Testing**

   - Add Jest for unit tests
   - Create integration tests
   - Add API documentation

4. **Deployment**
   - Add Docker configuration
   - Set up CI/CD pipeline
   - Configure production environment
