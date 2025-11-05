# Admin System Setup Instructions

## Quick Start

### 1. Create Your First Admin

```bash
cd server
npm run create-admin
```

You'll be prompted to enter:

- Username
- Email
- Password

### 2. Start the Application

**Server:**

```bash
cd server
npm run dev
```

**Client:**

```bash
cd client
npm run dev
```

### 3. Login as Admin

1. Navigate to `http://localhost:3000/admin/login`
2. Enter your admin email and password
3. Click "Sign In"

You'll be redirected to the admin dashboard at `/admin/overview`

## Admin Dashboard Features

### Overview Page (`/admin/overview`)

- Total users count
- New users (this month)
- Tests completed
- Total revenue
- Time period selector (7 days, 30 days, 90 days, All time)
- User growth chart
- Tests completed chart

### Users Page (`/admin/users`)

- List of all users with pagination (10 per page)
- Search by email or username
- Delete user functionality
- Click on user to view detailed information

### User Detail Page (`/admin/users/[userId]`)

- User information (name, email, username, phone)
- Total revenue from user
- Test history with scores
- Transaction history with receipts

## API Endpoints

### Admin Authentication

- `POST /api/admin/auth/login` - Admin login
- `POST /api/admin/auth/logout` - Admin logout
- `GET /api/admin/auth/me` - Get current admin

### Admin Operations

- `GET /api/admin/analytics?period=30` - Get analytics
- `GET /api/admin/users?page=1&limit=10&search=query` - List users
- `GET /api/admin/users/:userId` - Get user details
- `PUT /api/admin/users/:userId` - Update user
- `DELETE /api/admin/users/:userId` - Delete user

## Security Notes

1. **Separate Authentication**: Admin and user systems are completely separate
2. **Protected Routes**: All admin routes require admin authentication
3. **HTTP-Only Cookies**: Auth tokens stored securely
4. **Manual Creation**: Admins can only be created via CLI script
5. **No Overlap**: A person cannot be both a user and an admin

## Creating Additional Admins

To create more admin accounts:

```bash
cd server
npm run create-admin
```

## Troubleshooting

### "Not authorized" error

- Make sure you're logged in as admin
- Check that cookies are enabled in your browser
- Try logging out and logging in again

### Cannot access admin pages

- Ensure you're using `/admin/login` (not `/auth/signin`)
- Verify the admin account was created successfully
- Check server logs for authentication errors

### Server errors

- Make sure MongoDB is running
- Check environment variables (JWT_SECRET, MONGODB_URI)
- Verify server is running on the correct port

## File Structure

```
server/
├── src/
│   ├── controllers/
│   │   ├── admin.controller.ts          # Admin CRUD operations
│   │   └── adminAuth.controller.ts      # Admin authentication
│   ├── middleware/
│   │   └── adminAuth.ts                 # Admin auth middleware
│   ├── models/
│   │   └── admin.ts                     # Admin model
│   ├── routes/
│   │   ├── admin.ts                     # Admin management routes
│   │   └── adminAuth.ts                 # Admin auth routes
│   └── scripts/
│       └── createAdmin.ts               # CLI script to create admins

client/
├── src/
│   ├── app/
│   │   ├── admin/
│   │   │   ├── layout.tsx               # Admin layout with auth check
│   │   │   ├── login/
│   │   │   │   └── page.tsx             # Admin login page
│   │   │   ├── overview/
│   │   │   │   └── page.tsx             # Analytics dashboard
│   │   │   └── users/
│   │   │       ├── page.tsx             # Users list
│   │   │       └── [userId]/
│   │   │           └── page.tsx         # User detail page
│   │   └── components/
│   │       └── admin/
│   │           └── AdminSidebar.tsx     # Admin navigation
│   └── services/
│       ├── adminService.ts              # Admin API calls
│       └── adminAuthService.ts          # Admin auth API calls
```

## Next Steps

After setting up your first admin:

1. Test the login flow
2. Explore the analytics dashboard
3. Try managing users
4. Create additional admin accounts if needed

For detailed technical information, see `ADMIN_AUTH_DOCUMENTATION.md`
