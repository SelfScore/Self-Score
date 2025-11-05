# Admin Authentication System

This document describes the separate admin authentication system implemented for the LifeScore application.

## Overview

The admin system is completely separate from the regular user system:

- **Separate Model**: Admin model independent of User model
- **Separate Authentication**: Uses `adminAuthToken` cookie (vs `authToken` for users)
- **Separate Login**: Admin login at `/admin/login` route
- **Mutually Exclusive**: A person cannot be both a user and an admin
- **Manual Creation Only**: Admins must be created manually via CLI script

## Architecture

### Backend Components

1. **Model** (`/server/src/models/admin.ts`)

   - Fields: `username`, `email`, `password`
   - Email is unique and stored in lowercase
   - Password is hashed using bcryptjs

2. **Admin Auth Controller** (`/server/src/controllers/adminAuth.controller.ts`)

   - `login`: Authenticates admin and sets `adminAuthToken` cookie
   - `logout`: Clears the admin auth cookie
   - `getCurrentAdmin`: Returns current admin details

3. **Admin Controller** (`/server/src/controllers/admin.controller.ts`)

   - `getAnalytics`: Analytics data with time period filtering
   - `getUsers`: List users with pagination and search
   - `getUserById`: Get specific user details
   - `updateUser`: Update user information
   - `deleteUser`: Delete a user

4. **Admin Auth Middleware** (`/server/src/middleware/adminAuth.ts`)

   - Verifies `adminAuthToken` cookie
   - Checks JWT payload has `type: 'admin'`
   - Attaches admin to `req.admin`

5. **Routes**
   - `/api/admin/auth/login` (POST) - Admin login
   - `/api/admin/auth/logout` (POST) - Admin logout
   - `/api/admin/auth/me` (GET) - Get current admin
   - `/api/admin/analytics` (GET) - Analytics data
   - `/api/admin/users` (GET) - List users
   - `/api/admin/users/:userId` (GET) - Get user
   - `/api/admin/users/:userId` (PUT) - Update user
   - `/api/admin/users/:userId` (DELETE) - Delete user

### Frontend Components

1. **Admin Auth Service** (`/client/src/services/adminAuthService.ts`)

   - `loginAdmin`: Admin login
   - `logoutAdmin`: Admin logout
   - `getCurrentAdmin`: Get current admin session

2. **Admin Login Page** (`/client/src/app/admin/login/page.tsx`)

   - Separate login page for admins at `/admin/login`
   - Simple email/password form

3. **Admin Layout** (`/client/src/app/admin/layout.tsx`)

   - Checks for admin authentication on mount
   - Redirects to `/admin/login` if not authenticated
   - Shows loading spinner during auth check

4. **Admin Sidebar** (`/client/src/app/components/admin/AdminSidebar.tsx`)

   - Navigation: Overview, Users
   - Logout button (logs out admin, redirects to `/admin/login`)

5. **Admin Pages**
   - `/admin/overview` - Analytics dashboard
   - `/admin/users` - Users list with search and pagination
   - `/admin/users/[userId]` - User detail view

## Creating the First Admin

Since there's no signup page for admins, you must create the first admin manually:

```bash
cd server
npm run create-admin
```

This will prompt you for:

- Admin username
- Admin email
- Admin password

The script will:

1. Connect to MongoDB
2. Hash the password
3. Create the admin record
4. Display success message with admin details

## Security Features

1. **Separate JWT Tokens**

   - User token: `authToken` cookie
   - Admin token: `adminAuthToken` cookie
   - Different JWT payloads (`type: 'user'` vs `type: 'admin'`)

2. **Protected Routes**

   - All admin management routes require `adminAuthMiddleware`
   - Middleware verifies both token validity and admin type

3. **Password Security**

   - Passwords hashed with bcryptjs (salt rounds: 10)
   - Never returned in API responses

4. **HTTP-Only Cookies**
   - Both admin and user auth tokens stored in HTTP-only cookies
   - Not accessible via JavaScript
   - Secure flag in production

## Usage

### Admin Login Flow

1. Admin navigates to `/admin/login`
2. Enters email and password
3. Backend validates credentials
4. Sets `adminAuthToken` HTTP-only cookie
5. Redirects to `/admin/overview`

### Admin Accessing Protected Routes

1. Frontend makes request to `/api/admin/*`
2. `adminAuthMiddleware` checks `adminAuthToken` cookie
3. Verifies JWT and checks `type: 'admin'`
4. Attaches admin to `req.admin`
5. Controller processes request

### Admin Logout Flow

1. Admin clicks logout button
2. Frontend calls `/api/admin/auth/logout`
3. Backend clears `adminAuthToken` cookie
4. Redirects to `/admin/login`

## Development

### Creating Additional Admins

```bash
cd server
npm run create-admin
```

### Testing Admin Login

1. Create an admin using the script
2. Start the server: `npm run dev`
3. Navigate to `http://localhost:3000/admin/login`
4. Login with admin credentials
5. Access admin dashboard

### Environment Variables

Required in `.env`:

- `JWT_SECRET` - Secret key for signing JWT tokens
- `JWT_EXPIRE` - Token expiration time (default: "7d")
- `MONGODB_URI` - MongoDB connection string

## Differences from User System

| Feature     | User System                 | Admin System               |
| ----------- | --------------------------- | -------------------------- |
| Signup      | Public signup page          | Manual CLI creation only   |
| Login Route | `/auth/signin`              | `/admin/login`             |
| Cookie Name | `authToken`                 | `adminAuthToken`           |
| JWT Type    | `type: 'user'`              | `type: 'admin'`            |
| Model       | User                        | Admin                      |
| Middleware  | `authMiddleware`            | `adminAuthMiddleware`      |
| Access      | Tests, assessments, profile | User management, analytics |

## Future Enhancements

Potential improvements:

- Admin permissions/roles (super admin, moderator, etc.)
- Admin activity logs
- Two-factor authentication for admins
- Admin password reset via secure email flow
- Admin account management page (change password, update profile)
