import { Router } from "express";
import authRoutes from "./auth";
import questionRoutes from "./questions";
import questionsResponseRoutes from "./questionsResponse";
import subscriptionRoutes from "./subscription";
import paymentRoutes from "./payment";
import adminRoutes from "./admin";
import adminAuthRoutes from "./adminAuth";
import contactRoutes from "./contact";
import aiInterviewRoutes from "./aiInterview";
import level4ReviewRoutes from "./level4Review";
import level5ReviewRoutes from "./level5Review";
import consultantAuthRoutes from "./consultantAuth";
import consultantRoutes from "./consultant";
import googleCalendarRoutes from "./googleCalendar";
import bookingRoutes from "./booking";
import realtimeInterviewRoutes from "./realtimeInterview";
import level3Routes from "./level3";
// import calcomRoutes from './calcom';

const router = Router();

// API Routes
router.use("/auth", authRoutes);
router.use("/questions-response", questionsResponseRoutes);
router.use("/questions", questionRoutes);
router.use("/subscription", subscriptionRoutes);
router.use("/payment", paymentRoutes);
router.use("/contact", contactRoutes);
router.use("/admin/auth", adminAuthRoutes);
router.use("/admin", adminRoutes);
router.use("/admin/level4", level4ReviewRoutes);
router.use("/admin/level5", level5ReviewRoutes);
router.use("/ai-interview", aiInterviewRoutes);
router.use("/realtime-interview", realtimeInterviewRoutes); // NEW: Realtime voice interview
router.use("/consultant/auth", consultantAuthRoutes);
router.use("/consultants", consultantRoutes);
router.use("/google-calendar", googleCalendarRoutes);
router.use("/booking", bookingRoutes);
router.use("/level3", level3Routes);
// router.use('/calcom', calcomRoutes);

// Health check route
router.get("/health", (req, res) => {
  res.json({
    success: true,
    message: "Server is running!",
    timestamp: new Date().toISOString(),
  });
});

export default router;
