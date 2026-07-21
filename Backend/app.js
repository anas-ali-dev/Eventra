import express from "express";
import cors from "cors";

import bookingRoutes from "./Routes/booking.routes.js";
import reviewRoutes from "./Routes/review.routes.js";

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) =>
{
    res.json(
    {
        success: true,
        message: "Eventra Backend API is Running."
    });
});

app.use("/booking", bookingRoutes);

app.use("/review", reviewRoutes);

export default app;