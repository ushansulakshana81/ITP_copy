// Import mongoose
const mongoose = require("mongoose");

// Connect to MongoDB
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("MongoDB Connected Successfully!");
    } catch (error) {
        console.error("MongoDB Connection Failed:", error.message);
        process.exit(1); // Stop server on failure
    }
};

module.exports = connectDB;