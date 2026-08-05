import dns from "dns";
import mongoose from "mongoose";

// Fix "querySrv ECONNREFUSED" on Windows — use public DNS for MongoDB SRV lookup
dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const LOCAL_FALLBACK_URI =
  process.env.MONGO_URI_LOCAL || "mongodb://127.0.0.1:27017/eventra";
const ATLAS_MAX_ATTEMPTS = 2;

const connectOptions = {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 15000,
  family: 4,
};

const printAtlasHelp = () => {
  console.warn("\n--- MongoDB Atlas network access ---");
  console.warn("1. Open https://cloud.mongodb.com → your cluster → Network Access");
  console.warn("2. Add IP Address → use your current public IP, or 0.0.0.0/0 for dev");
  console.warn("3. Or set USE_LOCAL_MONGO=true in Backend/.env to skip Atlas\n");
};

const tryConnect = async (uri, label) => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(uri, connectOptions);
  console.log(`MongoDB Connected Successfully (${label})`);
};

const connectDB = async () => {
  if (process.env.USE_LOCAL_MONGO === "true") {
    await tryConnect(LOCAL_FALLBACK_URI, "local");
    return;
  }

  const atlasUri = process.env.MONGO_URI;

  if (!atlasUri) {
    console.error("MONGO_URI is missing in Backend/.env");
    process.exit(1);
  }

  for (let attempt = 1; attempt <= ATLAS_MAX_ATTEMPTS; attempt += 1) {
    try {
      await tryConnect(atlasUri, "Atlas");
      return;
    } catch (error) {
      console.error(
        `Atlas connection failed (${attempt}/${ATLAS_MAX_ATTEMPTS}):`,
        error.message
      );

      if (attempt === 1) {
        printAtlasHelp();
      }
    }
  }

  if (process.env.USE_LOCAL_MONGO === "false") {
    console.error(
      "Atlas is required (USE_LOCAL_MONGO=false). Fix Network Access in Atlas and restart."
    );
    process.exit(1);
  }

  console.warn("Atlas unavailable — falling back to local MongoDB...");
  try {
    await tryConnect(LOCAL_FALLBACK_URI, "local");
  } catch (localError) {
    console.error("Local MongoDB connection failed:", localError.message);
    console.error(
      "Start the MongoDB service on Windows, or fix Atlas network access."
    );
    process.exit(1);
  }
};

export default connectDB;
