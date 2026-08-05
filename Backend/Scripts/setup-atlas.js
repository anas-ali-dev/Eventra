import dns from "dns";
import dotenv from "dotenv";
import mongoose from "mongoose";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

dotenv.config();

dns.setServers(["8.8.8.8", "8.8.4.4", "1.1.1.1"]);

const backendRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const tryAtlas = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is missing in Backend/.env");
  }

  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  await mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 12000,
    family: 4,
  });
};

const waitForAtlas = async (maxAttempts = 36) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await tryAtlas();
      console.log("MongoDB Atlas connected.");
      return;
    } catch {
      console.log(`Attempt ${attempt}/${maxAttempts}: waiting for Atlas...`);
      if (attempt === 1) {
        console.log('\n>>> In Atlas, click: "Add Current IP Address"\n');
      }
      await sleep(5000);
    }
  }

  throw new Error("Atlas still blocked. Click Add Current IP Address in MongoDB Atlas.");
};

const run = async () => {
  await waitForAtlas();

  const Event = (await import("../Models/event.model.js")).default;
  const User = (await import("../Models/user.model.js")).default;

  const events = await Event.countDocuments();
  const users = await User.countDocuments();
  console.log(`Atlas "eventra": ${events} events, ${users} users.`);

  await mongoose.disconnect();

  if (events === 0) {
    console.log("Seeding Atlas database...");
    const result = spawnSync("npm", ["run", "seed"], {
      cwd: backendRoot,
      stdio: "inherit",
      shell: true,
      env: { ...process.env, USE_LOCAL_MONGO: "false" },
    });
    process.exit(result.status ?? 1);
  }

  console.log("Atlas is ready.");
};

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
