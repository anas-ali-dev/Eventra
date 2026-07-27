import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./Config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing. Copy Backend/.env.example to Backend/.env and set your MongoDB connection string.");
    process.exit(1);
  }

  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
};

start().catch((error) => {
  console.error("Failed to start server:", error.message);
  process.exit(1);
});
