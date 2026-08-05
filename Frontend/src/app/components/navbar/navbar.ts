import { Component, HostListener } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { EventService } from '../../services/event.service';
import { AuthService } from '../../services/auth.service';
import { BookingService } from '../../services/booking.service';
import { EventItem } from '../../models/event.model';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, FormsModule],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class NavbarComponent {

  searchTerm = '';
  showResults = false;
  searchResults: EventItem[] = [];
  mobileMenuOpen = false;

  constructor(
    private eventService: EventService,
    private auth: AuthService,
    private bookingService: BookingService,
    private router: Router
  ) {}

  get user() {
    return this.auth.currentUser();
  }

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  get initials(): string {
    const name = this.user?.name || '';
    return name
      .split(' ')
      .map(part => part.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }

  onSearchInput(): void {
    const term = this.searchTerm.trim();
    if (term.length < 1) {
      this.searchResults = [];
      this.showResults = false;
      return;
    }

    this.searchResults = this.eventService.search(term).slice(0, 6);
    this.showResults = this.searchResults.length > 0;
  }

  onSearchSubmit(event: Event): void {
    event.preventDefault();
    this.goToSearchResults();
  }

  goToSearchResults(): void {
    const term = this.searchTerm.trim();
    if (!term) return;

    this.router.navigate(['/events'], { queryParams: { q: term } });
    this.closeMobileMenu();
  }

  openEvent(event: EventItem): void {
    this.searchTerm = event.title;
    this.showResults = false;
    this.closeMobileMenu();
    this.router.navigate(['/event', event.id]);
  }

  toggleMobileMenu(): void {
    this.mobileMenuOpen = !this.mobileMenuOpen;
    if (!this.mobileMenuOpen) {
      this.showResults = false;
    }
  }

  closeMobileMenu(): void {
    this.mobileMenuOpen = false;
    this.showResults = false;
  }

  logout(): void {
    this.bookingService.clearOnLogout();
    this.auth.logout();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent): void {
    const target = event.target as HTMLElement;
    if (!target.closest('.search-box')) {
      this.showResults = false;
    }
  }

}
