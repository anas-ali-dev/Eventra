export interface TicketTier {
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  price: number;
  availableTickets: number;
  perks?: string[];
}

export interface Venue {
  _id?: string;
  name: string;
  address: string;
  city: string;
  capacity?: number;
  description?: string;
  image?: string;
  ticketTiers?: TicketTier[];
}
