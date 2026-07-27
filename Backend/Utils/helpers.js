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

export const sanitizeUser = (user) => ({
  id: user._id.toString(),
  name: user.name,
  email: user.email,
  phone: user.phone || "",
  city: user.city || "",
  favouriteCategory: user.favouriteCategory || "Concert",
  profilePicture: user.profilePicture || "",
  role: user.role,
  savedEvents: (user.savedEvents || []).map((event) =>
    event?._id ? event._id.toString() : String(event),
  ),
  createdAt: user.createdAt,
});
