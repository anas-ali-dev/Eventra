export const buildDefaultTicketTiers = (basePrice, totalTickets) => {
  const general = Math.max(0, Math.floor(totalTickets * 0.55));
  const stage = Math.max(0, Math.floor(totalTickets * 0.3));
  const vip = Math.max(0, totalTickets - general - stage);

  return [
    {
      name: "General Admission",
      slug: "general",
      description: "Standard entry with great atmosphere.",
      price: basePrice,
      availableTickets: general,
      perks: ["General entry", "Standing area access"],
    },
    {
      name: "Stage View",
      slug: "stage-view",
      description: "Closer to the action with elevated sightlines.",
      price: Math.round(basePrice * 1.45),
      availableTickets: stage,
      perks: ["Premium standing zone", "Closer to stage", "Dedicated entry lane"],
    },
    {
      name: "VIP Lounge",
      slug: "vip",
      description: "The full premium experience.",
      price: Math.round(basePrice * 2.25),
      availableTickets: vip,
      perks: ["VIP seating", "Lounge access", "Complimentary refreshments", "Priority entry"],
    },
  ];
};

export const generateBookingRef = () =>
  `EVT-${Math.floor(100000 + Math.random() * 900000)}`;

export const normalizeEmail = (email = "") => email.trim().toLowerCase();

export const isMongoObjectId = (value) =>
  typeof value === "string" && /^[a-fA-F0-9]{24}$/.test(value);

export const resolveEventQuery = (EventModel, eventId, populate = false) => {
  if (eventId === undefined || eventId === null || eventId === "") {
    return null;
  }

  const idStr = String(eventId);
  let query = null;

  if (isMongoObjectId(idStr)) {
    query = EventModel.findById(idStr);
  } else if (!Number.isNaN(Number(idStr))) {
    query = EventModel.findOne({ legacyId: Number(idStr) });
  }

  if (!query) {
    return null;
  }

  if (populate) {
    query = query.populate("category").populate("organizer").populate("venueRef");
  }

  return query;
};

/** Gate / section details shown on digital tickets. */
export const getTicketEntryDetails = (ticketTierName = "") => {
  const name = ticketTierName.toLowerCase();

  if (name.includes("vip")) {
    return {
      gate: "VIP Entrance — Gate V",
      section: "VIP Lounge",
      zone: "Executive Suite · Priority Access",
    };
  }

  if (name.includes("stage")) {
    return {
      gate: "Premium Entry — Gate B",
      section: "Stage View",
      zone: "Premium Standing Zone",
    };
  }

  return {
    gate: "Main Entrance — Gate A",
    section: "General Admission",
    zone: "Main Floor · Standing Area",
  };
};

export const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  city: user.city || "",
  favouriteCategory: user.favouriteCategory || "Concert",
  profilePicture: user.profilePicture || "",
  role: user.role,
  isVerified: !!user.isVerified,
  savedEvents: (user.savedEvents || []).map((event) =>
    event?._id ? event._id.toString() : String(event),
  ),
  createdAt: user.createdAt,
});
