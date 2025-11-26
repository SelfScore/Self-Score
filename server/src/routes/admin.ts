import { Router } from 'express';
import { AdminController } from '../controllers/admin.controller';
import { adminAuthMiddleware } from '../middleware/adminAuth';

const router = Router();

// All admin routes require admin authentication

// GET /api/admin/counts - Get badge counts for sidebar
router.get('/counts', adminAuthMiddleware, AdminController.getCounts);

// GET /api/admin/analytics - Get analytics data
router.get('/analytics', adminAuthMiddleware, AdminController.getAnalytics);

// GET /api/admin/users - Get all users with pagination
router.get('/users', adminAuthMiddleware, AdminController.getUsers);

// GET /api/admin/users/:userId - Get specific user details
router.get('/users/:userId', adminAuthMiddleware, AdminController.getUserById);

// PUT /api/admin/users/:userId - Update user
router.put('/users/:userId', adminAuthMiddleware, AdminController.updateUser);

// DELETE /api/admin/users/:userId - Delete user
router.delete('/users/:userId', adminAuthMiddleware, AdminController.deleteUser);

// Contact Messages Routes
// GET /api/admin/messages - Get all contact messages with pagination
router.get('/messages', adminAuthMiddleware, AdminController.getContactMessages);

// GET /api/admin/messages/:messageId - Get specific message
router.get('/messages/:messageId', adminAuthMiddleware, AdminController.getContactMessageById);

// PATCH /api/admin/messages/:messageId - Update message (mark read, add reply, delete)
router.patch('/messages/:messageId', adminAuthMiddleware, AdminController.updateContactMessage);

// Consultant Management Routes
// GET /api/admin/consultants - Get all consultants with filters
router.get('/consultants', adminAuthMiddleware, AdminController.getConsultants);

// GET /api/admin/consultants/:id - Get specific consultant details
router.get('/consultants/:id', adminAuthMiddleware, AdminController.getConsultantById);

// PATCH /api/admin/consultants/:id/approve - Approve consultant
router.patch('/consultants/:id/approve', adminAuthMiddleware, AdminController.approveConsultant);

// PATCH /api/admin/consultants/:id/reject - Reject consultant with reason
router.patch('/consultants/:id/reject', adminAuthMiddleware, AdminController.rejectConsultant);

export default router;
