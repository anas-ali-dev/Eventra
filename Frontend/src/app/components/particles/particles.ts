import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-particles',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="particles" aria-hidden="true">
      @for (p of particles; track p.id) {
        <span
          class="particle"
          [style.left.%]="p.left"
          [style.animationDuration.s]="p.duration"
          [style.animationDelay.s]="p.delay"
          [style.width.px]="p.size"
          [style.height.px]="p.size"
          [style.opacity]="p.opacity">
        </span>
      }
    </div>
  `,
  styles: [`
    .particles {
      position: absolute;
      inset: 0;
      overflow: hidden;
      pointer-events: none;
      z-index: 1;
    }

    .particle {
      position: absolute;
      bottom: -20px;
      border-radius: 50%;
      background: radial-gradient(circle, rgba(0, 230, 118, 0.9) 0%, rgba(0, 200, 83, 0.2) 70%, transparent 100%);
      box-shadow: 0 0 12px rgba(0, 230, 118, 0.45);
      animation: rise linear infinite;
    }

    @keyframes rise {
      0% {
        transform: translateY(0) translateX(0) scale(1);
        opacity: 0;
      }
      8% { opacity: 1; }
      92% { opacity: 0.5; }
      100% {
        transform: translateY(-200vh) translateX(30px) scale(0.2);
        opacity: 0;
      }
    }
  `]
})
export class ParticlesComponent implements OnInit {

  particles: {
    id: number;
    left: number;
    duration: number;
    delay: number;
    size: number;
    opacity: number;
  }[] = [];

  ngOnInit(): void {
    this.particles = Array.from({ length: 40 }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      duration: 8 + Math.random() * 14,
      delay: Math.random() * 12,
      size: 3 + Math.random() * 5,
      opacity: 0.25 + Math.random() * 0.45
    }));
  }

}
