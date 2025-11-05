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

const createAdmin = async () => {
    try {
        // Connect to MongoDB
        const MONGODB_URI = process.env.MONGODB_URI;
        
        if (!MONGODB_URI) {
            console.error('❌ MONGODB_URI not found in environment variables');
            console.error('Please make sure .env file exists with MONGODB_URI');
            process.exit(1);
        }
        
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGODB_URI);
        console.log('✅ Connected to MongoDB');

        // Get admin details
        const username = await question('Enter admin username: ');
        const email = await question('Enter admin email: ');
        const password = await question('Enter admin password: ');

        if (!username || !email || !password) {
            console.error('All fields are required');
            process.exit(1);
        }

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email: email.toLowerCase() });
        if (existingAdmin) {
            console.error('Admin with this email already exists');
            process.exit(1);
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create admin
        const admin = await Admin.create({
            username,
            email: email.toLowerCase(),
            password: hashedPassword
        });

        console.log('\n✅ Admin created successfully!');
        console.log(`Username: ${admin.username}`);
        console.log(`Email: ${admin.email}`);
        console.log(`ID: ${admin._id}`);

        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error);
        process.exit(1);
    } finally {
        rl.close();
    }
};

createAdmin();
