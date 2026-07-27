import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { PageBackdropComponent } from '../../components/page-backdrop/page-backdrop';
import { EventCardComponent } from '../../components/event-card/event-card';
import { ReviewCard } from '../../components/review-card/review-card';
import { EventService } from '../../services/event.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { EventItem } from '../../models/event.model';

interface Review {
  name: string;
  rating: number;
  comment: string;
  date: string;
}

@Component({
  selector: 'app-event-details',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    PageBackdropComponent,
    EventCardComponent,
    ReviewCard
  ],
  templateUrl: './event-details.html',
  styleUrl: './event-details.css'
})
export class EventDetailsComponent implements OnInit {

  event: EventItem | undefined;
  relatedEvents: EventItem[] = [];
  isSaved = false;
  saveLoading = false;

  reviews: Review[] = [
    {
      name: 'Youssef Kamal',
      rating: 5,
      comment: 'Amazing atmosphere and the sound quality was incredible. Would definitely come again.',
      date: '2 weeks ago'
    },
    {
      name: 'Mariam Adel',
      rating: 4,
      comment: 'Great show overall, though the entry lines took a while. Worth it in the end.',
      date: '1 month ago'
    },
    {
      name: 'Omar Farid',
      rating: 5,
      comment: 'One of the best live experiences I have had in Cairo. Highly recommend.',
      date: '1 month ago'
    }
  ];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private userService: UserService,
    private auth: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const loaded = await this.eventService.ensureEventLoaded(id);
    this.event = loaded ?? this.eventService.getById(id);

    if (this.event) {
      this.relatedEvents = this.eventService.getAll()
        .filter(e => e.category === this.event!.category && e.id !== this.event!.id)
        .slice(0, 4);
      this.checkSaved();
    }
  }

  get averageRating(): number {
    if (this.reviews.length === 0) return 0;
    const total = this.reviews.reduce((sum, r) => sum + r.rating, 0);
    return Math.round((total / this.reviews.length) * 10) / 10;
  }

  formatDate(isoDate: string): string {
    return this.eventService.formatDate(isoDate);
  }

  goToBooking(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.router.navigate(['/booking'], { queryParams: { eventId: this.event?.id } });
  }

  toggleSave(): void {
    if (!this.event) return;

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    this.saveLoading = true;
    const action = this.isSaved
      ? this.userService.unsaveEvent(this.event.mongoId || this.event.id)
      : this.userService.saveEvent(this.event.mongoId || this.event.id);

    action.subscribe({
      next: () => {
        this.isSaved = !this.isSaved;
        this.saveLoading = false;
      },
      error: () => {
        this.saveLoading = false;
      }
    });
  }

  private checkSaved(): void {
    if (!this.event || !this.auth.isLoggedIn()) return;
    this.isSaved = this.userService.isEventSaved(this.event);
  }

}
