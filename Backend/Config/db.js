import dns from "dns";
import mongoose from "mongoose";

// Fix "querySrv ECONNREFUSED" on Windows — use public DNS for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const connectDB = async () => {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    console.error("MONGO_URI is missing in Backend/.env");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,
      socketTimeoutMS: 15000,
      family: 4,
    });

    console.log("MongoDB Connected Successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

export default connectDB;
