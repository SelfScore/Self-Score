/**
 * Migration script to remove old Cal.com indexes from bookings collection
 * Run this once to clean up the database
 * 
 * Usage: npx ts-node src/scripts/removeCalcomIndexes.ts
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';

async function removeCalcomIndexes() {
    try {
        console.log('🔗 Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        const db = mongoose.connection.db;
        if (!db) {
            throw new Error('Database connection not established');
        }
        const collection = db.collection('bookings');

        console.log('\n📋 Listing current indexes...');
        const indexes = await collection.indexes();
        console.log('Current indexes:', indexes.map(i => i.name));

        // Drop old Cal.com related indexes if they exist
        const indexesToDrop = [
            'calcomBookingId_1',
            'calcomBookingUid_1'
        ];

        for (const indexName of indexesToDrop) {
            try {
                await collection.dropIndex(indexName);
                console.log(`✅ Dropped index: ${indexName}`);
            } catch (error: any) {
                if (error.code === 27 || error.message.includes('not found')) {
                    console.log(`ℹ️  Index not found (already removed): ${indexName}`);
                } else {
                    console.error(`❌ Error dropping index ${indexName}:`, error.message);
                }
            }
        }

        console.log('\n📋 Final indexes:');
        const finalIndexes = await collection.indexes();
        console.log(finalIndexes.map(i => i.name));

        console.log('\n✅ Migration completed successfully!');
        
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.connection.close();
        console.log('🔌 Disconnected from MongoDB');
        process.exit(0);
    }
}

removeCalcomIndexes();
