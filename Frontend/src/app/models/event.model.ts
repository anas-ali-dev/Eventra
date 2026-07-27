import { TicketTier, Venue } from '../shared/models/venue.model';

export interface EventItem {
  id: number;
  mongoId?: string;
  title: string;
  category: string;
  date: string;
  time: string;
  venue: string;
  city: string;
  price: number;
  image: string;
  banner: string;
  imagePosition?: string;
  bannerPosition?: string;
  heroCardAlign?: 'left' | 'right';
  bannerSize?: string;
  heroLayout?: 'side' | 'bottom';
  heroCardCompact?: boolean;
  cardImagePosition?: string;
  description: string;
  availableTickets: number;
  rating: number;
  ticketTiers?: TicketTier[];
  venueRef?: Venue;
}
