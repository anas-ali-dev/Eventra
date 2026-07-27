import { Component, OnDestroy, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';

import { EventService } from '../../services/event.service';
import { EventItem } from '../../models/event.model';

@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './hero.html',
  styleUrl: './hero.css'
})
export class HeroComponent implements OnInit, OnDestroy {

  slides: EventItem[] = [];
  activeIndex = 0;

  private autoSlideTimer: ReturnType<typeof setInterval> | null = null;

  private readonly slideDuration = 5000;

  constructor(private eventService: EventService) {}

  ngOnInit(): void {
    this.slides = this.eventService.getHeroSlides();
    this.startAutoSlide();
  }

  ngOnDestroy(): void {
    this.stopAutoSlide();
  }

  get activeSlide(): EventItem | undefined {
    return this.slides[this.activeIndex];
  }

  goToSlide(index: number): void {
    this.activeIndex = index;
    this.restartAutoSlide();
  }

  nextSlide(): void {
    this.activeIndex = (this.activeIndex + 1) % this.slides.length;
    this.restartAutoSlide();
  }

  prevSlide(): void {
    this.activeIndex = (this.activeIndex - 1 + this.slides.length) % this.slides.length;
    this.restartAutoSlide();
  }

  formatDate(isoDate: string): string {
    return this.eventService.formatDate(isoDate);
  }

  private startAutoSlide(): void {
    this.autoSlideTimer = setInterval(() => this.nextSlide(), this.slideDuration);
  }

  private stopAutoSlide(): void {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
      this.autoSlideTimer = null;
    }
  }

  private restartAutoSlide(): void {
    this.stopAutoSlide();
    this.startAutoSlide();
  }

}
