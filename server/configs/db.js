import mongoose from "mongoose";

const databaseName = process.env.MONGODB_DB_NAME || 'quickshow';

const connectDB = async () => {
    mongoose.connection.on('connected', () => {
        console.log('MongoDB connected successfully');
    });

    mongoose.connection.on('error', (error) => {
        console.error('MongoDB connection error:', error.message);
    });

    await mongoose.connect(`${process.env.MONGODB_URI}/${databaseName}`, {
        serverSelectionTimeoutMS: 5000,
    });
}

export const disconnectDB = async () => {
    if (mongoose.connection.readyState !== 0) {
        await mongoose.connection.close();
    }
}

export const getDbHealth = () => ({
    readyState: mongoose.connection.readyState,
    status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
});

export default connectDB;
