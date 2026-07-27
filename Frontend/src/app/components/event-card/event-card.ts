import { Component, Input } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-event-card',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './event-card.html',
  styleUrl: './event-card.css'
})
export class EventCardComponent {

  @Input() id: number = 0;

  @Input() title = '';

  @Input() category = '';

  @Input() date = '';

  @Input() location = '';

  @Input() image = '';

  @Input() imagePosition = 'center center';

  @Input() variant: 'default' | 'squarish' | 'square' = 'default';

}