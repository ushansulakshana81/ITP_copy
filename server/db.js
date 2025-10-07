import mongoose from 'mongoose';

if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI must be set. Did you forget to provision MongoDB?");
}

// MongoDB connection with improved error handling
export const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            retryWrites: true,
            w: 'majority'
        });
        console.log(`MongoDB Connected: ${conn.connection.host}`);
        return conn;
    } catch (error) {
        console.error('MongoDB connection error:', error);
        console.log('Note: MongoDB Atlas may require IP whitelisting. Continuing with fallback...');
        // Don't exit the process, let the application continue with fallback storage
        throw error;
    }
};

export default mongoose;