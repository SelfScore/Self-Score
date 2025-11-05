import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Admin from '../models/admin';
import * as readline from 'readline';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

const question = (query: string): Promise<string> => {
    return new Promise((resolve) => {
        rl.question(query, resolve);
    });
};

const resetAdminPassword = async () => {
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

        // List all admins
        const admins = await Admin.find().select('-password');
        
        if (admins.length === 0) {
            console.log('❌ No admin users found in the database');
            console.log('Run "npx ts-node src/scripts/createAdmin.ts" to create one');
            process.exit(1);
        }

        console.log('Available admin users:\n');
        admins.forEach((admin, index) => {
            console.log(`${index + 1}. ${admin.username} (${admin.email})`);
        });

        console.log('');
        const email = await question('Enter admin email to reset password: ');
        const newPassword = await question('Enter new password: ');
        const confirmPassword = await question('Confirm new password: ');

        if (newPassword !== confirmPassword) {
            console.error('❌ Passwords do not match');
            process.exit(1);
        }

        if (!newPassword || newPassword.length < 6) {
            console.error('❌ Password must be at least 6 characters');
            process.exit(1);
        }

        // Find admin
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        
        if (!admin) {
            console.error('❌ Admin not found with email:', email);
            process.exit(1);
        }

        // Hash new password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update password
        admin.password = hashedPassword;
        await admin.save();

        console.log('\n✅ Password reset successfully!');
        console.log(`Admin: ${admin.username} (${admin.email})`);

        process.exit(0);
    } catch (error) {
        console.error('Error resetting password:', error);
        process.exit(1);
    } finally {
        rl.close();
    }
};

resetAdminPassword();
