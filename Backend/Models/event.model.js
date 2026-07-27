import mongoose from "mongoose";

const ticketTierSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, trim: true, lowercase: true },
    description: { type: String, trim: true, default: "" },
    price: { type: Number, required: true, min: 0 },
    availableTickets: { type: Number, required: true, min: 0 },
    perks: { type: [String], default: [] },
  },
  { _id: true },
);

const eventSchema = new mongoose.Schema(
  {
    legacyId: {
      type: Number,
      unique: true,
      sparse: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 1000,
    },

    date: {
      type: Date,
      required: true,
    },

    time: {
      type: String,
      trim: true,
      default: "8:00 PM",
    },

    location: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },

    venue: {
      type: String,
      trim: true,
      default: "",
    },

    city: {
      type: String,
      trim: true,
      default: "",
    },

    venueRef: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Venue",
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

    ticketTiers: {
      type: [ticketTierSchema],
      default: [],
    },

    image: {
      type: String,
      default: "",
    },

    banner: {
      type: String,
      default: "",
    },

    imagePosition: { type: String, default: "center center" },
    bannerPosition: { type: String, default: "center center" },
    cardImagePosition: { type: String, default: "" },
    heroCardAlign: {
      type: String,
      enum: ["left", "right"],
      default: "right",
    },
    bannerSize: { type: String, default: "cover" },
    heroLayout: {
      type: String,
      enum: ["side", "bottom"],
      default: "side",
    },
    heroCardCompact: { type: Boolean, default: false },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 4.5,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    categoryName: {
      type: String,
      trim: true,
      default: "",
    },

    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["Available", "Sold Out"],
      default: "Available",
    },
  },
  {
    timestamps: true,
  },
);

const Event = mongoose.model("Event", eventSchema);

export default Event;
