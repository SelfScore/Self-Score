import mongoose from 'mongoose';
import Admin from '../models/admin';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const listAdmins = async () => {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI;
        
        if (!MONGODB_URI) {
            console.error('❌ MONGODB_URI not found in environment variables');
            process.exit(1);
        }
        
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB\n');

        // Get all admins
        const admins = await Admin.find().select('-password');
        
        if (admins.length === 0) {
            console.log('❌ No admin users found in the database');
            console.log('Run "npx ts-node src/scripts/createAdmin.ts" to create one');
        } else {
            console.log(`✅ Found ${admins.length} admin user(s):\n`);
            admins.forEach((admin, index) => {
                console.log(`${index + 1}. Username: ${admin.username}`);
                console.log(`   Email: ${admin.email}`);
                console.log(`   ID: ${admin._id}`);
                console.log(`   Created: ${admin.createdAt}\n`);
            });
        }

        process.exit(0);
    } catch (error) {
        console.error('Error listing admins:', error);
        process.exit(1);
    }
};

listAdmins();
