import mongoose from "mongoose";


// Function to connect to MongoDB using Mongoose
export const connectDB = async () => {
  try {
    // Attempt to connect to MongoDB using the connection string from environment variables
    const conn = await mongoose.connect(process.env.MONGODB_URL);

    console.log(`✅ Database connected: ${conn.connection.host}`);
  } catch (error) {
    console.error("❌ Database connection failed:", error.message);

    // Exit process with failure code to stop the application
    process.exit(1); 
  }
};
