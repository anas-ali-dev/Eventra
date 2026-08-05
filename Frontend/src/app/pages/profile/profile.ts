import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { finalize } from 'rxjs';

import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { PageBackdropComponent } from '../../components/page-backdrop/page-backdrop';
import { EventCardComponent } from '../../components/event-card/event-card';
import { EventService } from '../../services/event.service';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { EventItem } from '../../models/event.model';
import { User } from '../../shared/models/user.model';
import { getApiErrorMessage } from '../../shared/utils/api-error';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    NavbarComponent,
    FooterComponent,
    PageBackdropComponent,
    EventCardComponent
  ],
  templateUrl: './profile.html',
  styleUrl: './profile.css'
})
export class ProfileComponent implements OnInit {

  profile: User | null = null;
  editedProfile: Partial<User> = {};
  isEditing = false;
  bookingsCount = 0;
  savedEventsCount = 0;
  savedEvents: EventItem[] = [];
  loading = true;
  saveMessage = '';
  showPasswordForm = false;
  currentPassword = '';
  newPassword = '';
  confirmPassword = '';
  passwordError = '';
  passwordSuccess = '';
  passwordLoading = false;
  showDeleteForm = false;
  deletePassword = '';
  deleteConfirmText = '';
  deleteError = '';
  deleteLoading = false;

  constructor(
    private eventService: EventService,
    private userService: UserService,
    private auth: AuthService,
    private bookingService: BookingService,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadProfile();
  }

  get initials(): string {
    const name = this.profile?.name || '';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  startEditing(): void {
    if (!this.profile) return;
    this.editedProfile = { ...this.profile };
    this.isEditing = true;
  }

  saveProfile(): void {
    if (!this.profile) return;

    this.userService.updateProfile({
      name: this.editedProfile.name,
      phone: this.editedProfile.phone,
      city: this.editedProfile.city,
      favouriteCategory: this.editedProfile.favouriteCategory
    }).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.profile = res.data;
          this.isEditing = false;
          this.saveMessage = 'Profile updated!';
        }
      }
    });
  }

  cancelEditing(): void {
    this.isEditing = false;
  }

  togglePasswordForm(): void {
    this.showPasswordForm = !this.showPasswordForm;
    this.showDeleteForm = false;
    this.passwordError = '';
    this.passwordSuccess = '';
    this.currentPassword = '';
    this.newPassword = '';
    this.confirmPassword = '';
  }

  toggleDeleteForm(): void {
    this.showDeleteForm = !this.showDeleteForm;
    this.showPasswordForm = false;
    this.deletePassword = '';
    this.deleteConfirmText = '';
    this.deleteError = '';
  }

  deleteAccount(): void {
    this.deleteError = '';

    if (!this.deletePassword) {
      this.deleteError = 'Enter your password to confirm deletion.';
      return;
    }

    if (this.deleteConfirmText.trim().toUpperCase() !== 'DELETE') {
      this.deleteError = 'Type DELETE in the confirmation box to proceed.';
      return;
    }

    this.deleteLoading = true;

    this.userService.deleteAccount(this.deletePassword).pipe(
      finalize(() => {
        this.deleteLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.bookingService.clearStoredBookings();
          this.auth.clearSession();
          void this.router.navigate(['/register'], {
            queryParams: { deleted: '1' }
          });
        } else {
          this.deleteError = res.message || 'Could not delete account.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.deleteError = getApiErrorMessage(err, 'Could not delete account.');
        this.cdr.detectChanges();
      }
    });
  }

  changePassword(): void {
    this.passwordError = '';
    this.passwordSuccess = '';

    if (!this.currentPassword || !this.newPassword) {
      this.passwordError = 'Please fill in all password fields.';
      return;
    }

    if (this.newPassword.length < 8) {
      this.passwordError = 'New password must be at least 8 characters.';
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      this.passwordError = 'New passwords do not match.';
      return;
    }

    this.passwordLoading = true;

    this.userService.changePassword(this.currentPassword, this.newPassword).pipe(
      finalize(() => {
        this.passwordLoading = false;
        this.cdr.detectChanges();
      })
    ).subscribe({
      next: (res) => {
        if (res.success) {
          this.passwordSuccess = res.message || 'Password changed. Please log in again.';
          this.showPasswordForm = false;
          setTimeout(() => this.auth.logout(), 2000);
        } else {
          this.passwordError = res.message || 'Could not change password.';
        }
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.passwordError = getApiErrorMessage(err, 'Could not change password.');
        this.cdr.detectChanges();
      }
    });
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      this.userService.updateProfile({ profilePicture: dataUrl }).subscribe({
        next: (res) => {
          if (res.success && res.data) {
            this.profile = res.data;
          }
        }
      });
    };
    reader.readAsDataURL(file);
  }

  unsaveEvent(event: EventItem): void {
    this.userService.unsaveEvent(event.mongoId || event.id).subscribe({
      next: () => {
        this.loadSavedEvents();
        this.savedEventsCount = this.userService.getSavedCount();
        this.cdr.markForCheck();
      }
    });
  }

  formatDate(isoDate: string): string {
    return this.eventService.formatDate(isoDate);
  }

  private loadProfile(): void {
    const cached = this.auth.currentUser();

    if (cached) {
      this.profile = cached;
      this.loading = false;
    } else {
      this.loading = true;
    }

    this.userService.getProfile().pipe(
      finalize(() => {
        this.loading = false;
      })
    ).subscribe({
      next: (res) => {
        if (res.success && res.data) {
          this.profile = res.data;
          this.bookingsCount = res.data.bookingsCount ?? 0;
          this.savedEventsCount = res.data.savedEventsCount ?? this.userService.getSavedCount();
        } else if (!this.profile) {
          this.profile = this.auth.currentUser();
        }

        this.refreshStats();
      },
      error: () => {
        if (!this.profile) {
          this.profile = this.auth.currentUser();
        }
        this.refreshStats();
      }
    });
  }

  private refreshStats(): void {
    this.bookingService.hydrateFromCache();
    this.bookingsCount = Math.max(
      this.bookingsCount,
      this.bookingService.getGroupedBookingsCount()
    );
    this.savedEventsCount = Math.max(
      this.savedEventsCount,
      this.userService.getSavedCount()
    );
    this.cdr.markForCheck();

    void this.bookingService.loadBookings(true).then(() => {
      this.bookingsCount = Math.max(
        this.bookingsCount,
        this.bookingService.getGroupedBookingsCount()
      );
      this.cdr.markForCheck();
    });

    this.loadSavedEvents();
  }

  private loadSavedEvents(): void {
    this.userService.getSavedEvents().subscribe({
      next: (res) => {
        if (res.success && res.data?.length) {
          this.savedEvents = (res.data as Record<string, unknown>[]).map(raw =>
            this.eventService.getById(Number(raw['legacyId'])) ||
            this.mapRawEvent(raw)
          ).filter((e): e is EventItem => !!e);
          this.savedEventsCount = res.count ?? this.savedEvents.length;
        } else {
          this.savedEvents = [];
          this.savedEventsCount = this.userService.getSavedCount();
        }
        this.cdr.markForCheck();
      },
      error: () => {
        this.savedEvents = [];
        this.savedEventsCount = this.userService.getSavedCount();
        this.cdr.markForCheck();
      }
    });
  }

  private mapRawEvent(raw: Record<string, unknown>): EventItem | undefined {
    const legacyId = Number(raw['legacyId']);
    if (!legacyId) return undefined;

    return {
      id: legacyId,
      mongoId: String(raw['_id'] || ''),
      title: String(raw['title'] || ''),
      category: String(raw['categoryName'] || 'Concert'),
      date: String(raw['date'] || '').split('T')[0],
      time: String(raw['time'] || ''),
      venue: String(raw['venue'] || ''),
      city: String(raw['city'] || ''),
      price: Number(raw['price'] || 0),
      image: String(raw['image'] || ''),
      banner: String(raw['banner'] || raw['image'] || ''),
      description: String(raw['description'] || ''),
      availableTickets: Number(raw['availableTickets'] || 0),
      rating: Number(raw['rating'] || 4.5)
    };
  }

}
