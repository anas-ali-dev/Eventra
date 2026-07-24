import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./Config/db.js";

dotenv.config();

const PORT = process.env.PORT || 5000;

// Connect Database
connectDB();

// Start Server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
