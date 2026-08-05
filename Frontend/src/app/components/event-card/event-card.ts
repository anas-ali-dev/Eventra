import { Component, Input, OnChanges } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';
import { UserService } from '../../services/user.service';
import { EventItem } from '../../models/event.model';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css'
})
export class EventCardComponent implements OnChanges {

  @Input() id: number = 0;
  @Input() mongoId = '';
  @Input() title = '';
  @Input() category = '';
  @Input() date = '';
  @Input() location = '';
  @Input() image = '';
  @Input() imagePosition = 'center center';
  @Input() variant: 'default' | 'squarish' | 'square' = 'default';
  @Input() showSave = true;

  isSaved = false;
  saveLoading = false;

  constructor(
    private auth: AuthService,
    private userService: UserService,
    private router: Router
  ) {}

  ngOnChanges(): void {
    this.refreshSavedState();
  }

  get canSave(): boolean {
    return this.showSave && this.auth.isLoggedIn();
  }

  toggleSave(event: MouseEvent): void {
    event.preventDefault();
    event.stopPropagation();

    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    const eventRef = this.mongoId || this.id;
    this.saveLoading = true;

    const action = this.isSaved
      ? this.userService.unsaveEvent(eventRef)
      : this.userService.saveEvent(eventRef);

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

  private refreshSavedState(): void {
    if (!this.auth.isLoggedIn()) {
      this.isSaved = false;
      return;
    }

    const stub: EventItem = {
      id: this.id,
      mongoId: this.mongoId,
      title: this.title,
      category: this.category,
      date: '',
      time: '',
      venue: '',
      city: '',
      price: 0,
      image: this.image,
      banner: this.image,
      description: '',
      availableTickets: 0,
      rating: 0
    };

    this.isSaved = this.userService.isEventSaved(stub);
  }

}
