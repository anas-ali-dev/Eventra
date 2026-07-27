import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar';
import { FooterComponent } from '../../components/footer/footer';
import { PageBackdropComponent } from '../../components/page-backdrop/page-backdrop';
import { EventCardComponent } from '../../components/event-card/event-card';
import { EventService } from '../../services/event.service';
import { EventItem } from '../../models/event.model';

type DateFilter = 'all' | 'week' | 'month' | 'upcoming';
type PriceFilter = 'all' | 'under500' | '500to1000' | 'over1000';

@Component({
  selector: 'app-events',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    NavbarComponent,
    FooterComponent,
    PageBackdropComponent,
    EventCardComponent
  ],
  templateUrl: './events.html',
  styleUrl: './events.css'
})
export class EventsComponent implements OnInit {

  private allEvents: EventItem[] = [];

  categories: string[] = [];

  searchTerm = '';
  activeCategory = 'All';
  dateFilter: DateFilter = 'all';
  priceFilter: PriceFilter = 'all';

  pageSize = 8;
  visibleCount = this.pageSize;

  constructor(
    private eventService: EventService,
    private route: ActivatedRoute
  ) {
    this.allEvents = this.eventService.getAll();
    this.categories = ['All', ...this.eventService.getCategories()];
  }

  ngOnInit(): void {
    const category = this.route.snapshot.queryParamMap.get('category');
    if (category && this.categories.includes(category)) {
      this.activeCategory = category;
    }

    const q = this.route.snapshot.queryParamMap.get('q');
    if (q) {
      this.searchTerm = q;
    }

    this.route.queryParamMap.subscribe(params => {
      const search = params.get('q');
      if (search !== null) {
        this.searchTerm = search;
      }
      const cat = params.get('category');
      if (cat && this.categories.includes(cat)) {
        this.activeCategory = cat;
      }
    });
  }

  get filteredEvents(): EventItem[] {
    const term = this.searchTerm.trim().toLowerCase();

    return this.allEvents.filter(event => {

      const matchesSearch = !term ||
        event.title.toLowerCase().includes(term) ||
        event.category.toLowerCase().includes(term) ||
        event.venue.toLowerCase().includes(term) ||
        event.city.toLowerCase().includes(term) ||
        event.description.toLowerCase().includes(term);

      const matchesCategory = this.activeCategory === 'All' ||
        event.category === this.activeCategory;

      const matchesDate = this.matchesDateFilter(event);

      const matchesPrice = this.matchesPriceFilter(event);

      return matchesSearch && matchesCategory && matchesDate && matchesPrice;
    });
  }

  get visibleEvents(): EventItem[] {
    return this.filteredEvents.slice(0, this.visibleCount);
  }

  get hasMore(): boolean {
    return this.visibleCount < this.filteredEvents.length;
  }

  private matchesDateFilter(event: EventItem): boolean {
    if (this.dateFilter === 'all') return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const eventDate = new Date(event.date);

    if (this.dateFilter === 'upcoming') {
      return eventDate >= today;
    }

    if (this.dateFilter === 'week') {
      const weekFromNow = new Date(today);
      weekFromNow.setDate(today.getDate() + 7);
      return eventDate >= today && eventDate <= weekFromNow;
    }

    if (this.dateFilter === 'month') {
      const monthFromNow = new Date(today);
      monthFromNow.setMonth(today.getMonth() + 1);
      return eventDate >= today && eventDate <= monthFromNow;
    }

    return true;
  }

  private matchesPriceFilter(event: EventItem): boolean {
    switch (this.priceFilter) {
      case 'under500':
        return event.price < 500;
      case '500to1000':
        return event.price >= 500 && event.price <= 1000;
      case 'over1000':
        return event.price > 1000;
      default:
        return true;
    }
  }

  setCategory(category: string): void {
    this.activeCategory = category;
    this.visibleCount = this.pageSize;
  }

  onFiltersChanged(): void {
    this.visibleCount = this.pageSize;
  }

  loadMore(): void {
    this.visibleCount += this.pageSize;
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.activeCategory = 'All';
    this.dateFilter = 'all';
    this.priceFilter = 'all';
    this.visibleCount = this.pageSize;
  }

  formatDate(isoDate: string): string {
    return this.eventService.formatDate(isoDate);
  }
}