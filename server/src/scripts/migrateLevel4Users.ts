/**
 * Migration Script: Reset Level 4 Users for Pay-Per-Use Model
 * 
 * This script migrates existing users from the boolean-based purchase tracking
 * to the new attempt-based pay-per-use model.
 * 
 * What it does:
 * - Finds all users with purchasedLevels.level4.purchased: true
 * - Resets their level4.remainingAttempts to 0
 * - Initializes level5.remainingAttempts to 0
 * - Removes the old 'purchased' field from level4
 * 
 * Usage: npx ts-node src/scripts/migrateLevel4Users.ts
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

const MONGODB_URI = process.env.MONGODB_URI || "";

interface OldUserSchema {
    _id: mongoose.Types.ObjectId;
    email: string;
    username: string;
    purchasedLevels: {
        level2: { purchased: boolean };
        level3: { purchased: boolean };
        level4: { purchased?: boolean; remainingAttempts?: number };
        level5?: { remainingAttempts?: number };
    };
}

async function migrateLevel4Users() {
    if (!MONGODB_URI) {
        console.error("❌ MONGODB_URI is not set in environment variables");
        process.exit(1);
    }

    try {
        console.log("🔗 Connecting to MongoDB...");
        await mongoose.connect(MONGODB_URI);
        console.log("✅ Connected to MongoDB");

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error("Database connection not established");
        }

        const usersCollection = db.collection("users");

        // Find all users with the old purchased: true for level4
        const usersWithLevel4 = await usersCollection
            .find({ "purchasedLevels.level4.purchased": true })
            .toArray();

        console.log(`\n📊 Found ${usersWithLevel4.length} users with Level 4 purchased\n`);

        if (usersWithLevel4.length === 0) {
            console.log("✅ No users to migrate. All done!");
            await mongoose.disconnect();
            return;
        }

        // Log affected users for audit
        console.log("Affected users:");
        console.log("================");
        for (const user of usersWithLevel4) {
            console.log(`  - ${user.email} (${user.username})`);
        }
        console.log("");

        // Prompt for confirmation
        console.log("⚠️  This will reset all these users' Level 4 purchase status.");
        console.log("   They will need to purchase again to take Level 4 and Level 5 tests.\n");

        // Update all users: reset to 0 attempts
        const updateResult = await usersCollection.updateMany(
            { "purchasedLevels.level4.purchased": true },
            {
                $set: {
                    "purchasedLevels.level4.remainingAttempts": 0,
                    "purchasedLevels.level5.remainingAttempts": 0,
                },
                $unset: {
                    "purchasedLevels.level4.purchased": "", // Remove old field
                },
            }
        );

        console.log(`\n✅ Migration complete!`);
        console.log(`   Modified: ${updateResult.modifiedCount} users`);
        console.log(`   Matched: ${updateResult.matchedCount} users`);

        // Also update any users that don't have level5 field at all
        const initLevel5Result = await usersCollection.updateMany(
            { "purchasedLevels.level5": { $exists: false } },
            {
                $set: {
                    "purchasedLevels.level5": {
                        remainingAttempts: 0,
                    },
                },
            }
        );

        console.log(`   Initialized Level 5 for: ${initLevel5Result.modifiedCount} users`);

        await mongoose.disconnect();
        console.log("\n🔌 Disconnected from MongoDB");
    } catch (error) {
        console.error("❌ Migration failed:", error);
        await mongoose.disconnect();
        process.exit(1);
    }
}

// Run the migration
migrateLevel4Users();
