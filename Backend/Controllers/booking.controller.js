import Booking from "../Models/booking.model.js";
import Event from "../Models/event.model.js";
import User from "../Models/user.model.js";
import {
  generateBookingRef,
  resolveEventQuery,
  getTicketEntryDetails,
} from "../Utils/helpers.js";
import { queueBookingConfirmationEmail } from "../Services/email.service.js";

const SERVICE_FEE_PER_TICKET = 25;
const VALID_PROMO_CODES = {
  EVENTRA10: 0.1,
  WELCOME15: 0.15,
};

const resolveEvent = async (eventId) => {
  const query = resolveEventQuery(Event, eventId);
  return query ? query.exec() : null;
};

export const createBooking = async (req, res) => {
  try {
    const {
      event: eventId,
      tickets,
      ticketTierId,
      ticketTierSlug,
      ticketTierName,
      unitPrice,
      promoCode,
    } = req.body;

    const event = await resolveEvent(eventId);

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found." });
    }

    const qty = Number(tickets) || 1;

    if (qty < 1) {
      return res.status(400).json({ success: false, message: "Invalid ticket quantity." });
    }

    let tier = null;

    if (ticketTierId && event.ticketTiers?.length) {
      tier = event.ticketTiers.find((t) => t._id.toString() === ticketTierId);
    }

    if (!tier && ticketTierSlug && event.ticketTiers?.length) {
      tier = event.ticketTiers.find(
        (t) => t.slug === ticketTierSlug,
      );
    }

    if (!tier && ticketTierName && event.ticketTiers?.length) {
      tier = event.ticketTiers.find(
        (t) => t.name.toLowerCase() === ticketTierName.toLowerCase(),
      );
    }

    if (!tier && event.ticketTiers?.length) {
      tier = event.ticketTiers[0];
    }

    const price = tier ? tier.price : unitPrice ?? event.price;
    const tierName = tier ? tier.name : ticketTierName || "General Admission";
    const tierId = tier ? tier._id.toString() : ticketTierId || "";

    if (tier && tier.availableTickets < qty) {
      return res.status(400).json({
        success: false,
        message: "Not enough tickets available for this tier.",
      });
    }

    if (!tier && event.availableTickets < qty) {
      return res.status(400).json({
        success: false,
        message: "Not enough tickets available.",
      });
    }

    const subtotal = price * qty;
    const serviceFee = SERVICE_FEE_PER_TICKET * qty;
    const code = (promoCode || "").trim().toUpperCase();
    const discountRate = VALID_PROMO_CODES[code] || 0;
    const discount = Math.round(subtotal * discountRate);
    const totalPrice = subtotal + serviceFee - discount;

    const booking = await Booking.create({
      user: req.user.id,
      event: event._id,
      bookingRef: generateBookingRef(),
      ticketTierId: tierId,
      ticketTierName: tierName,
      unitPrice: price,
      tickets: qty,
      serviceFee,
      promoCode: discountRate ? code : "",
      discount,
      totalPrice,
    });

    if (tier) {
      tier.availableTickets -= qty;
      event.availableTickets = Math.max(0, event.availableTickets - qty);
      event.markModified("ticketTiers");

      if (event.ticketTiers.every((t) => t.availableTickets === 0)) {
        event.status = "Sold Out";
      }

      await event.save();
    } else {
      event.availableTickets = Math.max(0, event.availableTickets - qty);

      if (event.availableTickets === 0) {
        event.status = "Sold Out";
      }

      await event.save();
    }

    const populated = await Booking.findById(booking._id).populate({
      path: "event",
      populate: { path: "venueRef" },
    });

    const clientUrl = process.env.CLIENT_URL || "http://localhost:4200";
    const ticketLink = `${clientUrl}/ticket/${booking.bookingRef}`;

    void User.findById(req.user.id)
      .then((user) => {
        if (user && populated?.event) {
          queueBookingConfirmationEmail(user, booking, populated.event, ticketLink);
        }
      })
      .catch((emailErr) => {
        console.error("Booking confirmation email queue failed:", emailErr.message);
      });

    return res.status(201).json({
      success: true,
      message: "Booking created successfully.",
      data: populated,
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ success: false, message: error.message });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getBookings = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    }

    const bookings = await Booking.find().populate("user").populate("event");

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getMyBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .populate("event")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getUserBookings = async (req, res) => {
  try {
    if (req.user.role !== "admin" && req.user.id !== req.params.id) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    }

    const bookings = await Booking.find({ user: req.params.id })
      .populate("event")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ success: false, message: "Invalid user id." });
    }

    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getEventBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ event: req.params.id }).populate("user");

    return res.status(200).json({
      success: true,
      count: bookings.length,
      data: bookings,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id).populate("event");

    if (!booking) {
      return res.status(404).json({ success: false, message: "Booking not found." });
    }

    if (
      req.user.role !== "admin" &&
      booking.user.toString() !== req.user.id
    ) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to perform this action.",
      });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({
        success: false,
        message: "Booking is already cancelled.",
      });
    }

    booking.status = "Cancelled";
    await booking.save();

    const event = await Event.findById(booking.event._id || booking.event);

    if (event) {
      event.availableTickets += booking.tickets;

      if (booking.ticketTierId && event.ticketTiers?.length) {
        let tier = event.ticketTiers.id(booking.ticketTierId);

        if (!tier && booking.ticketTierName) {
          tier = event.ticketTiers.find(
            (t) => t.name.toLowerCase() === booking.ticketTierName.toLowerCase(),
          );
        }

        if (tier) {
          tier.availableTickets += booking.tickets;
          event.markModified("ticketTiers");
        }
      }

      if (event.status === "Sold Out" && event.availableTickets > 0) {
        event.status = "Available";
      }

      await event.save();
    }

    return res.status(200).json({
      success: true,
      message: "Booking cancelled successfully.",
      data: booking,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

const buildEventPayload = (event) => ({
  legacyId: event?.legacyId,
  title: event?.title,
  image: event?.image,
  banner: event?.banner || event?.image,
  date: event?.date,
  time: event?.time,
  venue: event?.venue,
  city: event?.city,
  venueAddress: event?.venueRef?.address || `${event?.venue}, ${event?.city}`,
});

const buildTicketPasses = (booking, event, holder, entry) => {
  const eventPayload = buildEventPayload(event);
  const passes = [];

  for (let index = 1; index <= booking.tickets; index += 1) {
    passes.push({
      passCode: `${booking.bookingRef}-${index}`,
      passNumber: index,
      passesInBooking: booking.tickets,
      bookingRef: booking.bookingRef,
      ticketTierName: booking.ticketTierName,
      unitPrice: booking.unitPrice,
      totalPrice: booking.totalPrice,
      status: booking.status,
      holderName: holder?.name || "",
      holderEmail: holder?.email || "",
      entryGate: entry.gate,
      section: entry.section,
      zone: entry.zone,
      event: eventPayload,
    });
  }

  return passes;
};

export const getBookingTicket = async (req, res) => {
  try {
    const booking = await Booking.findOne({
      bookingRef: req.params.ref,
      user: req.user.id,
    }).populate({
      path: "event",
      populate: { path: "venueRef" },
    });

    if (!booking) {
      return res.status(404).json({ success: false, message: "Ticket not found." });
    }

    const event = booking.event;
    const entry = getTicketEntryDetails(booking.ticketTierName);
    const holder = await User.findById(req.user.id);
    const passes = buildTicketPasses(booking, event, holder, entry);

    return res.status(200).json({
      success: true,
      data: {
        bookingRef: booking.bookingRef,
        tickets: booking.tickets,
        ticketTierName: booking.ticketTierName,
        unitPrice: booking.unitPrice,
        totalPrice: booking.totalPrice,
        status: booking.status,
        holderName: holder?.name || "",
        holderEmail: holder?.email || "",
        entryGate: entry.gate,
        section: entry.section,
        zone: entry.zone,
        passes,
        event: buildEventPayload(event),
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};

export const getBookingTickets = async (req, res) => {
  try {
    const refs = [
      ...new Set(
        String(req.query.refs || "")
          .split(",")
          .map((ref) => ref.trim())
          .filter(Boolean),
      ),
    ];

    if (!refs.length) {
      return res.status(400).json({
        success: false,
        message: "At least one booking reference is required.",
      });
    }

    const bookings = await Booking.find({
      bookingRef: { $in: refs },
      user: req.user.id,
    }).populate({
      path: "event",
      populate: { path: "venueRef" },
    });

    const holder = await User.findById(req.user.id);
    const passes = [];

    for (const ref of refs) {
      const booking = bookings.find((item) => item.bookingRef === ref);

      if (!booking) {
        continue;
      }

      const entry = getTicketEntryDetails(booking.ticketTierName);
      passes.push(...buildTicketPasses(booking, booking.event, holder, entry));
    }

    if (!passes.length) {
      return res.status(404).json({ success: false, message: "Tickets not found." });
    }

    return res.status(200).json({
      success: true,
      data: {
        passes,
        totalPasses: passes.length,
      },
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ success: false, message: "Server error." });
  }
};
