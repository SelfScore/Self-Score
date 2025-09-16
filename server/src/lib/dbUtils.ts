import mongoose from 'mongoose';

export const checkDatabaseConnection = (): boolean => {
    return mongoose.connection.readyState === 1; // 1 means connected
};

export const requireDatabase = () => {
    if (!checkDatabaseConnection()) {
        throw new Error('Database connection required but not available');
    }
};
