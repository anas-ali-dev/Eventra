import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-review-card',
  standalone: true,
  imports: [],
  templateUrl: './review-card.html',
  styleUrl: './review-card.css'
})
export class ReviewCard {

  @Input() name = '';

  @Input() rating = 5;

  @Input() comment = '';

  @Input() date = '';

  get initial(): string {
    return this.name.charAt(0).toUpperCase();
  }

  get stars(): number[] {
    return Array(5).fill(0).map((_, i) => i);
  }
}