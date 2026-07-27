import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { NavbarComponent } from '../../components/navbar/navbar';
import { HeroComponent } from '../../components/hero/hero';
import { EventCardComponent } from '../../components/event-card/event-card';
import { FooterComponent } from '../../components/footer/footer';
import { PageBackdropComponent } from '../../components/page-backdrop/page-backdrop';
import { EventService } from '../../services/event.service';
import { EventItem } from '../../models/event.model';

interface CategorySection {
  title: string;
  icon: string;
  category: string;
  events: EventItem[];
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    RouterLink,
    NavbarComponent,
    HeroComponent,
    EventCardComponent,
    FooterComponent,
    PageBackdropComponent
  ],
  templateUrl: './home.html',
  styleUrl: './home.css'
})
export class HomeComponent {

  trendingEvents: EventItem[] = [];
  categorySections: CategorySection[] = [];

  quickFilters = [
    { label: 'Concerts', icon: '🎵', category: 'Concert' },
    { label: 'Netflix', icon: '🎬', category: 'Streaming' },
    { label: 'Sports', icon: '⚽', category: 'Sports' },
    { label: 'Festivals', icon: '🎪', category: 'Festival' },
    { label: 'Comedy', icon: '🎤', category: 'Comedy' },
    { label: 'Theatre', icon: '🎭', category: 'Theatre' }
  ];

  stats = [
    { value: '28+', label: 'Live Events' },
    { value: '8', label: 'Categories' },
    { value: '6', label: 'Cities' }
  ];

  constructor(private eventService: EventService) {
    this.trendingEvents = this.eventService.getFeaturedConcerts();

    this.categorySections = [
      { title: 'Top Concerts', icon: '🎵', category: 'Concert', events: this.eventService.getConcerts() },
      { title: 'Netflix & Streaming', icon: '🎬', category: 'Streaming', events: this.eventService.getStreaming() },
      { title: 'Sports Events', icon: '⚽', category: 'Sports', events: this.eventService.getSports() },
      { title: 'Festivals', icon: '🎪', category: 'Festival', events: this.eventService.getFestivals() },
      { title: 'Comedy Nights', icon: '🎤', category: 'Comedy', events: this.eventService.getComedy() },
      { title: 'Theatre & Shows', icon: '🎭', category: 'Theatre', events: this.eventService.getTheatre() }
    ];
  }

  formatDate(isoDate: string): string {
    return this.eventService.formatDate(isoDate);
  }

}
