import { Component, OnInit, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';

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
export class EventDetailsComponent implements OnInit, OnDestroy {

  event: EventItem | undefined;
  relatedEvents: EventItem[] = [];
  isSaved = false;
  saveLoading = false;
  saveMessage = '';
  loading = true;

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

  private routeSub?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventService: EventService,
    private userService: UserService,
    private auth: AuthService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.routeSub = this.route.paramMap.subscribe(params => {
      const id = Number(params.get('id'));
      void this.loadEvent(id);
    });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
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
    this.saveMessage = '';
    const eventRef = this.event.mongoId || this.event.id;

    const action = this.isSaved
      ? this.userService.unsaveEvent(eventRef)
      : this.userService.saveEvent(eventRef);

    action.subscribe({
      next: (res) => {
        this.isSaved = !this.isSaved;
        this.saveLoading = false;
        this.saveMessage = res.message || (this.isSaved ? 'Event saved!' : 'Removed from saved.');
        this.cdr.markForCheck();
      },
      error: (err) => {
        this.saveLoading = false;
        this.saveMessage = err?.error?.message || 'Could not update saved events.';
        this.cdr.markForCheck();
      }
    });
  }

  private async loadSavedState(): Promise<void> {
    if (!this.event || !this.auth.isLoggedIn()) {
      this.isSaved = false;
      return;
    }

    this.isSaved = this.userService.isEventSaved(this.event);

    this.userService.getSavedEvents().subscribe({
      next: () => {
        if (this.event) {
          this.isSaved = this.userService.isEventSaved(this.event);
          this.cdr.markForCheck();
        }
      }
    });
  }

  private async loadEvent(id: number): Promise<void> {
    if (!id) {
      this.loading = false;
      this.event = undefined;
      this.cdr.markForCheck();
      return;
    }

    this.loading = true;
    this.event = this.eventService.getById(id);
    this.cdr.markForCheck();

    const loaded = await this.eventService.refreshEvent(id);
    this.event = loaded ?? this.eventService.getById(id);
    this.loading = false;

    if (this.event) {
      this.relatedEvents = this.eventService.getAll()
        .filter(e => e.category === this.event!.category && e.id !== this.event!.id)
        .slice(0, 4);
      this.checkSaved();
      void this.loadSavedState();
    } else {
      this.relatedEvents = [];
    }

    this.cdr.markForCheck();
  }

  private checkSaved(): void {
    if (!this.event || !this.auth.isLoggedIn()) return;
    this.isSaved = this.userService.isEventSaved(this.event);
  }

}
