import dotenv from "dotenv";
import mongoose from "mongoose";
import connectDB from "../Config/db.js";
import User from "../Models/user.model.js";
import Category from "../Models/category.model.js";
import Venue from "../Models/venue.model.js";
import Event from "../Models/event.model.js";
import { buildDefaultTicketTiers } from "../Utils/helpers.js";
import { seedEvents } from "./seedData.js";

dotenv.config();

const categories = [
  "Concert",
  "Sports",
  "Festival",
  "Streaming",
  "Technology",
  "Comedy",
  "Theatre",
];

const uniqueVenues = [...new Set(seedEvents.map((e) => `${e.venue}|${e.city}`))];

const runSeed = async () => {
  await connectDB();

  console.log("Seeding Eventra database...");

  let organizer = await User.findOne({ email: "organizer@eventra.com" });

  if (!organizer) {
    organizer = await User.create({
      name: "Eventra Organizer",
      email: "organizer@eventra.com",
      password: "Organizer123!",
      role: "organizer",
      isVerified: true,
    });
  }

  const categoryMap = {};

  for (const name of categories) {
    const cat = await Category.findOneAndUpdate(
      { name },
      { name, description: `${name} events on Eventra` },
      { upsert: true, new: true },
    );
    categoryMap[name] = cat._id;
  }

  const venueMap = {};

  for (const key of uniqueVenues) {
    const [name, city] = key.split("|");
    const sampleEvent = seedEvents.find((e) => e.venue === name && e.city === city);
    const tiers = buildDefaultTicketTiers(sampleEvent.price, sampleEvent.availableTickets);

    const venue = await Venue.findOneAndUpdate(
      { name, city },
      {
        name,
        city,
        address: `${name}, ${city}, Egypt`,
        capacity: sampleEvent.availableTickets * 2,
        description: `Host venue for events at ${name}.`,
        ticketTiers: tiers,
      },
      { upsert: true, new: true },
    );

    venueMap[key] = venue._id;
  }

  for (const item of seedEvents) {
    const venueKey = `${item.venue}|${item.city}`;
    const ticketTiers = item.ticketTiers || buildDefaultTicketTiers(item.price, item.availableTickets);

    await Event.findOneAndUpdate(
      { legacyId: item.legacyId },
      {
        ...item,
        date: new Date(item.date + "T00:00:00"),
        location: `${item.venue}, ${item.city}`,
        category: categoryMap[item.category],
        categoryName: item.category,
        organizer: organizer._id,
        venueRef: venueMap[venueKey],
        ticketTiers,
      },
      { upsert: true, new: true, runValidators: true },
    );
  }

  console.log(`Seeded ${seedEvents.length} events, ${categories.length} categories, ${uniqueVenues.length} venues.`);
  console.log("Organizer login: organizer@eventra.com / Organizer123!");

  await mongoose.connection.close();
  process.exit(0);
};

runSeed().catch((err) => {
  console.error(err);
  process.exit(1);
});
