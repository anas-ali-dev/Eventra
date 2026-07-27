import mongoose from "mongoose";

const ticketTierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    slug: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 300,
      default: "",
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    availableTickets: {
      type: Number,
      required: true,
      min: 0,
    },
    perks: {
      type: [String],
      default: [],
    },
  },
  { _id: true },
);

const venueSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    address: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    city: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    capacity: {
      type: Number,
      min: 0,
      default: 0,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: "",
    },
    image: {
      type: String,
      default: "",
    },
    ticketTiers: {
      type: [ticketTierSchema],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const Venue = mongoose.model("Venue", venueSchema);

export default Venue;
