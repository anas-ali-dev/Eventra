import { Component } from '@angular/core';
import { ParticlesComponent } from '../particles/particles';

@Component({
  selector: 'app-page-backdrop',
  standalone: true,
  imports: [ParticlesComponent],
  templateUrl: './page-backdrop.html',
  styleUrl: './page-backdrop.css'
})
export class PageBackdropComponent {}
