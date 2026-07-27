import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './categories.html',
  styleUrl: './categories.css'
})
export class CategoriesComponent {

  categories = [
    { name: 'Music', icon: '🎵', filter: 'Concert' },
    { name: 'Sports', icon: '⚽', filter: 'Sports' },
    { name: 'Netflix', icon: '🎬', filter: 'Streaming' },
    { name: 'Festivals', icon: '🎪', filter: 'Festival' },
    { name: 'Technology', icon: '💻', filter: 'Technology' },
    { name: 'Gaming', icon: '🎮', filter: 'Gaming' },
    { name: 'Comedy', icon: '🎤', filter: 'Comedy' },
    { name: 'Theatre', icon: '🎭', filter: 'Theatre' },
    { name: 'Food', icon: '🍔', filter: 'Food' },
    { name: 'Business', icon: '💼', filter: 'Business' }
  ];

}
