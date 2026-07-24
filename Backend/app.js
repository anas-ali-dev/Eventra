import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import swaggerSpec from "./Config/swagger.js";

import authRoutes from "./Routes/auth.routes.js";
import userRoutes from "./Routes/user.routes.js";
import categoryRoutes from "./Routes/category.routes.js";
import eventRoutes from "./Routes/event.routes.js";
import bookingRoutes from "./Routes/booking.routes.js";
import reviewRoutes from "./Routes/review.routes.js";

import errorMiddleware from "./middleware/error.middleware.js";

const app = express();

// ==============================
// Global Middlewares
// ==============================

app.use(cors());
app.use(express.json());

// ==============================
// Home Route
// ==============================

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Eventra Backend API is Running.",
  });
});

// ==============================
// API Routes
// ==============================

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/reviews", reviewRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ==============================
// 404 Route Handler
// ==============================

app.use((req, res) => {
  return res.status(404).json({
    success: false,
    message: "Route not found.",
  });
});

// ==============================
// Global Error Handler
// ==============================

app.use(errorMiddleware);

export default app;
