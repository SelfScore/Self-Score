import mongoose from "mongoose";

type ConnectionObject = {
    isConnected?: number;
}

const connection: ConnectionObject = {};

async function dbConnect(): Promise<void> {
    if (connection.isConnected) {
        console.log("Already connected to the database");
        return;
    }

    try {
        const mongoUri = process.env.MONGODB_URI || "mongodb://localhost:27017/lifescore";
        console.log("Attempting to connect to MongoDB...");
        
        const db = await mongoose.connect(mongoUri, {
            // Connection options
            maxPoolSize: 10, // Maintain up to 10 socket connections
            serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
            socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        });
        
        connection.isConnected = db.connections[0].readyState;
        console.log("✅ Connected to MongoDB successfully");
    } catch (error) {
        console.error("❌ Error connecting to the database:", error);
        console.log("🔄 Server will continue without database connection");
        console.log("💡 To fix this: Start MongoDB or update MONGODB_URI in .env");
        // Don't exit the process, let the server run without database
    }
}

export default dbConnect;
