import UserModel from "../models/user";
import { checkDatabaseConnection } from "./dbUtils";

/**
 * Sends ONE reminder email (fresh link + code) to users who signed up with
 * the new flow, still haven't verified their email after REMINDER_AFTER_DAYS.
 *
 * Safe with several server instances: each user is claimed atomically by
 * setting verificationReminderSentAt before the email is sent.
 */

const REMINDER_AFTER_DAYS = 3;
const RUN_EVERY_MS = 6 * 60 * 60 * 1000; // every 6 hours
const FIRST_RUN_DELAY_MS = 2 * 60 * 1000; // give the server time to boot
const MAX_PER_RUN = 200;

let timer: NodeJS.Timeout | null = null;
let running = false;

export const runVerificationReminders = async (): Promise<number> => {
  if (running || !checkDatabaseConnection()) return 0;
  running = true;
  let sent = 0;

  try {
    // Imported lazily to avoid a circular import at startup
    const { AuthController } = await import("../controllers/auth.controller");
    const cutoff = new Date(Date.now() - REMINDER_AFTER_DAYS * 24 * 60 * 60 * 1000);

    for (let i = 0; i < MAX_PER_RUN; i++) {
      const user = await UserModel.findOneAndUpdate(
        {
          isVerified: false,
          "authProviders.0": { $exists: true },
          createdAt: { $lte: cutoff },
          verificationReminderSentAt: { $exists: false },
        },
        { $set: { verificationReminderSentAt: new Date() } },
        { new: true }
      );
      if (!user) break;

      try {
        const ok = await AuthController.issueVerificationEmail(user, { reminder: true });
        if (ok) sent++;
      } catch (error) {
        console.error("Verification reminder failed for a user:", error);
      }
    }

    if (sent > 0) console.log(`📧 Sent ${sent} email verification reminder(s)`);
  } catch (error) {
    console.error("Verification reminder job failed:", error);
  } finally {
    running = false;
  }

  return sent;
};

export const startVerificationReminderJob = (): void => {
  if (timer || process.env.DISABLE_VERIFICATION_REMINDERS === "true") return;
  setTimeout(() => {
    void runVerificationReminders();
    timer = setInterval(() => void runVerificationReminders(), RUN_EVERY_MS);
    timer.unref();
  }, FIRST_RUN_DELAY_MS).unref();
};
