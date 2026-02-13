import mongoose from "mongoose";
import dotenv from "dotenv";
import RealtimeInterviewModel from "../models/realtimeInterview";
import Level5ReviewModel from "../models/level5Review";

dotenv.config();

/**
 * Migration script to update Level 5 interviews from COMPLETED to PENDING_REVIEW
 * Only updates interviews that don't have a submitted review yet
 */
async function migrateLevel5Status() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;

    if (!MONGODB_URI) {
      console.error("❌ MONGODB_URI not found in environment variables");
      process.exit(1);
    }

    console.log("🔄 Connecting to MongoDB...");
    await mongoose.connect(MONGODB_URI);
    console.log("✅ Connected to MongoDB\n");

    // Find all Level 5 interviews with COMPLETED status
    const completedInterviews = await RealtimeInterviewModel.find({
      level: 5,
      status: "COMPLETED",
    });

    console.log(
      `📊 Found ${completedInterviews.length} Level 5 interviews with COMPLETED status\n`,
    );

    if (completedInterviews.length === 0) {
      console.log("✅ No interviews to migrate");
      await mongoose.connection.close();
      return;
    }

    let migratedCount = 0;
    let skippedCount = 0;

    for (const interview of completedInterviews) {
      // Check if this interview has a submitted review
      const review = await Level5ReviewModel.findOne({
        interviewId: interview._id,
        status: "SUBMITTED",
      });

      if (review) {
        // Already reviewed, update to REVIEWED instead
        interview.status = "REVIEWED" as any;
        await interview.save();
        console.log(
          `  ✅ Updated interview ${interview._id} to REVIEWED (has review)`,
        );
        migratedCount++;
      } else {
        // No review yet, update to PENDING_REVIEW
        interview.status = "PENDING_REVIEW" as any;
        await interview.save();
        console.log(
          `  🔄 Updated interview ${interview._id} to PENDING_REVIEW (pending review)`,
        );
        migratedCount++;
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   Migrated: ${migratedCount} interviews`);
    console.log(`   Skipped: ${skippedCount} interviews`);

    await mongoose.connection.close();
    console.log("\n✅ Database connection closed");
  } catch (error) {
    console.error("❌ Migration failed:", error);
    await mongoose.connection.close();
    process.exit(1);
  }
}

// Run the migration
migrateLevel5Status();
