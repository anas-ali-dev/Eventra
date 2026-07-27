import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    event: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    bookingRef: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },

    ticketTierId: {
      type: String,
      default: "",
    },

    ticketTierName: {
      type: String,
      default: "General Admission",
    },

    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    tickets: {
      type: Number,
      required: true,
      min: 1,
    },

    serviceFee: {
      type: Number,
      default: 0,
      min: 0,
    },

    promoCode: {
      type: String,
      default: "",
    },

    discount: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalPrice: {
      type: Number,
      required: true,
      min: 0,
    },

    status: {
      type: String,
      enum: ["Booked", "Cancelled"],
      default: "Booked",
    },
  },
  {
    timestamps: true,
  },
);

const Booking = mongoose.model("Booking", bookingSchema);

export default Booking;
