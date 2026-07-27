import { EventItem } from '../models/event.model';

const img = (id: number) => ({
  image: `assets/images/events/${id}/poster.jpg`,
  banner: `assets/images/events/${id}/banner.jpg`,
  imagePosition: 'center center',
  bannerPosition: 'center center',
  bannerSize: 'cover',
  heroLayout: 'side' as const,
  heroCardCompact: false,
  cardImagePosition: undefined as string | undefined
});

const custom = (
  id: number,
  image: string,
  banner: string,
  imagePosition: string,
  bannerPosition: string,
  heroCardAlign: 'left' | 'right' = 'right',
  bannerSize = 'cover',
  heroLayout: 'side' | 'bottom' = 'side',
  heroCardCompact = false,
  cardImagePosition?: string
) => ({
  image: `assets/images/events/${id}/${image}`,
  banner: `assets/images/events/${id}/${banner}`,
  imagePosition,
  bannerPosition,
  heroCardAlign,
  bannerSize,
  heroLayout,
  heroCardCompact,
  cardImagePosition
});

export const MOCK_EVENTS: EventItem[] = [
  { id: 1, title: 'TUL8TE Live', category: 'Concert', date: '2026-08-18', time: '8:00 PM', venue: 'Cairo Stadium', city: 'Cairo', price: 950, ...custom(1, 'poster.jpg', 'banner.jpg', 'center center', 'center 32%', 'right', 'cover', 'bottom', false, 'center 38%'), description: 'TUL8TE brings his signature sound to Cairo Stadium for an unforgettable night of Egyptian rap.', availableTickets: 240, rating: 4.8 },
  { id: 2, title: 'Cairokee Live', category: 'Concert', date: '2026-07-25', time: '9:00 PM', venue: 'New Cairo Arena', city: 'New Cairo', price: 850, ...custom(2, 'poster.jpg', 'banner.png', 'center 42%', 'center center', 'left', 'cover', 'side', true, 'center 42%'), description: 'Cairokee returns with a full live show featuring their greatest hits and new releases.', availableTickets: 180, rating: 4.9 },
  { id: 3, title: 'Amr Diab', category: 'Concert', date: '2026-08-02', time: '9:30 PM', venue: 'North Coast Arena', city: 'North Coast', price: 1500, ...custom(3, 'poster.jpg', 'banner.jpg', 'left center', 'right center', 'right', 'cover', 'side', false, '32% center'), description: 'The legendary Amr Diab performs a summer concert under the stars at North Coast.', availableTickets: 320, rating: 5 },
  { id: 4, title: 'Marwan Pablo', category: 'Concert', date: '2026-08-12', time: '8:30 PM', venue: 'Zed Park', city: 'Giza', price: 700, ...custom(4, 'poster.jpg', 'banner.jpg', 'center 32%', 'center center', 'right', 'cover', 'side', false, 'center 35%'), description: 'Marwan Pablo live at Zed Park — Egyptian trap at its finest.', availableTickets: 210, rating: 4.6 },
  { id: 5, title: 'Wegz Live', category: 'Concert', date: '2026-08-20', time: '9:00 PM', venue: 'Alexandria Arena', city: 'Alexandria', price: 800, ...custom(5, 'poster.jpg', 'banner.jpg', 'center center', 'center center', 'left', 'cover', 'side', true, 'center center'), description: 'Wegz takes the stage in Alexandria for a high-energy rap concert.', availableTickets: 260, rating: 4.8 },
  { id: 6, title: 'Tamer Ashour Live', category: 'Concert', date: '2026-08-30', time: '8:00 PM', venue: 'Opera House', city: 'Cairo', price: 600, ...custom(6, 'poster.jpg', 'banner.jpg', 'center center', 'right center', 'left', 'cover', 'side', false, 'center top'), description: 'Tamer Ashour brings his soulful voice and greatest hits to the Cairo Opera House.', availableTickets: 150, rating: 4.95 },
  { id: 7, title: 'Hamza Namira', category: 'Concert', date: '2026-09-01', time: '8:00 PM', venue: 'Cairo Festival City', city: 'Cairo', price: 550, ...img(7), description: 'Hamza Namira live with soulful melodies and powerful lyrics.', availableTickets: 400, rating: 4.9 },
  { id: 8, title: 'Mohamed Mounir', category: 'Concert', date: '2026-09-08', time: '9:00 PM', venue: 'Al Alamein Amphitheatre', city: 'North Coast', price: 1200, ...img(8), description: 'The King Mohamed Mounir returns to the North Coast stage.', availableTickets: 280, rating: 5 },
  { id: 9, title: 'Ruby Live', category: 'Concert', date: '2026-09-12', time: '10:00 PM', venue: 'Zed Park', city: 'Giza', price: 650, ...img(9), description: 'Ruby brings pop energy and chart-topping hits to Zed Park.', availableTickets: 350, rating: 4.7 },
  { id: 10, title: 'Abo & The Band', category: 'Concert', date: '2026-09-18', time: '8:30 PM', venue: 'Maadi Theatre', city: 'Cairo', price: 450, ...img(10), description: 'Abo and band perform indie rock favorites in an intimate venue.', availableTickets: 120, rating: 4.6 },
  { id: 11, title: 'Lege-Cy & Marwan Pablo', category: 'Concert', date: '2026-09-22', time: '9:00 PM', venue: 'Cairo Stadium', city: 'Cairo', price: 750, ...custom(11, 'poster.jpg', 'banner.webp', 'center center', 'center top', 'right', 'cover', 'bottom', false, 'center top'), description: 'Lege-Cy and Marwan Pablo share the stage for a massive double headline at Cairo Stadium.', availableTickets: 500, rating: 4.8 },
  { id: 12, title: 'Al Ahly vs Zamalek', category: 'Sports', date: '2026-09-05', time: '7:00 PM', venue: 'Cairo Stadium', city: 'Cairo', price: 400, ...img(12), description: "The Cairo Derby — Egypt's biggest football rivalry.", availableTickets: 5000, rating: 5 },
  { id: 13, title: 'Pyramids FC vs Al Ahly', category: 'Sports', date: '2026-09-28', time: '6:00 PM', venue: '30 June Stadium', city: 'Cairo', price: 350, ...img(13), description: 'Top-of-the-table clash in the Egyptian Premier League.', availableTickets: 4200, rating: 4.9 },
  { id: 14, title: 'Egypt vs Nigeria', category: 'Sports', date: '2026-10-05', time: '8:00 PM', venue: 'Borg El Arab Stadium', city: 'Alexandria', price: 500, ...img(14), description: 'International friendly — Egypt hosts Nigeria in Alexandria.', availableTickets: 3500, rating: 4.8 },
  { id: 15, title: 'Cairo Basketball Classic', category: 'Sports', date: '2026-10-12', time: '7:30 PM', venue: 'Cairo Indoor Arena', city: 'Cairo', price: 250, ...img(15), description: 'Annual basketball showcase featuring top Egyptian clubs.', availableTickets: 800, rating: 4.5 },
  { id: 16, title: 'Comic Con Egypt', category: 'Festival', date: '2026-09-15', time: '11:00 AM', venue: 'Egypt Expo', city: 'Cairo', price: 350, ...img(16), description: 'Cosplay, panels, gaming zones, and exclusive merch.', availableTickets: 2000, rating: 4.7 },
  { id: 17, title: 'Sand Festival Sahel', category: 'Festival', date: '2026-08-25', time: '4:00 PM', venue: 'Marassi Beach', city: 'North Coast', price: 600, ...img(17), description: 'Beach festival with DJs, live acts, and sunset vibes.', availableTickets: 1500, rating: 4.8 },
  { id: 18, title: 'Cairo Jazz Festival', category: 'Festival', date: '2026-10-20', time: '7:00 PM', venue: 'Garden City', city: 'Cairo', price: 400, ...img(18), description: 'Three nights of jazz under the Cairo sky.', availableTickets: 600, rating: 4.6 },
  { id: 19, title: 'Netflix Fan Fest Cairo', category: 'Streaming', date: '2026-09-20', time: '6:00 PM', venue: 'Cairo Festival City', city: 'Cairo', price: 450, ...img(19), description: 'Meet cast members and watch exclusive Netflix previews live.', availableTickets: 800, rating: 4.8 },
  { id: 20, title: 'Squid Game Experience', category: 'Streaming', date: '2026-10-01', time: '5:00 PM', venue: 'Mall of Egypt', city: 'Giza', price: 550, ...img(20), description: 'Immersive Squid Game pop-up with challenges and photo ops.', availableTickets: 600, rating: 4.9 },
  { id: 21, title: 'Stranger Things Watch Party', category: 'Streaming', date: '2026-10-10', time: '8:00 PM', venue: 'Zed Park', city: 'Giza', price: 300, ...img(21), description: 'Big-screen finale watch party under the stars.', availableTickets: 400, rating: 4.7 },
  { id: 22, title: 'Wednesday Addams Night', category: 'Streaming', date: '2026-10-18', time: '7:00 PM', venue: 'Greek Campus', city: 'Cairo', price: 350, ...img(22), description: 'Netflix Wednesday-themed night with costumes and screenings.', availableTickets: 350, rating: 4.8 },
  { id: 23, title: 'Cairo Tech Summit', category: 'Technology', date: '2026-10-15', time: '10:00 AM', venue: 'Smart Village', city: 'Cairo', price: 750, ...img(23), description: 'Keynotes, workshops, and networking with regional tech leaders.', availableTickets: 350, rating: 4.6 },
  { id: 24, title: 'AI & Future Expo', category: 'Technology', date: '2026-11-01', time: '11:00 AM', venue: 'Egypt Expo', city: 'Cairo', price: 500, ...img(24), description: 'Explore AI demos, startups, and the future of tech in MENA.', availableTickets: 900, rating: 4.7 },
  { id: 25, title: 'Stand-Up Comedy Night', category: 'Comedy', date: '2026-09-25', time: '9:00 PM', venue: 'Room Art Space', city: 'Cairo', price: 300, ...img(25), description: "Egypt's funniest comedians on one stage.", availableTickets: 200, rating: 4.5 },
  { id: 26, title: 'Bassem Youssef Live', category: 'Comedy', date: '2026-10-08', time: '8:00 PM', venue: 'Cairo Opera House', city: 'Cairo', price: 800, ...img(26), description: 'Satirical comedy and sharp wit from Bassem Youssef.', availableTickets: 450, rating: 4.9 },
  { id: 27, title: 'Phantom of the Opera', category: 'Theatre', date: '2026-11-10', time: '7:30 PM', venue: 'Cairo Opera House', city: 'Cairo', price: 900, ...img(27), description: 'A stunning production of the classic musical.', availableTickets: 300, rating: 4.8 },
  { id: 28, title: 'Romeo & Juliet', category: 'Theatre', date: '2026-11-20', time: '8:00 PM', venue: 'Al Gomhouria Theatre', city: 'Alexandria', price: 400, ...img(28), description: "Shakespeare's timeless love story on the Alexandria stage.", availableTickets: 180, rating: 4.6 }
];
