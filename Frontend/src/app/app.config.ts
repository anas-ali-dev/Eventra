import { ApplicationConfig, APP_INITIALIZER } from '@angular/core';
import { provideRouter, withRouterConfig } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';

import { routes } from './app.routes';
import { authInterceptor } from './interceptors/auth.interceptor';
import { EventService } from './services/event.service';
import { BookingService } from './services/booking.service';
import { AuthService } from './services/auth.service';

export function initApp(
  eventService: EventService,
  bookingService: BookingService,
  auth: AuthService
) {
  return () => {
    eventService.init();

    if (auth.isLoggedIn()) {
      bookingService.hydrateFromCache();
      void bookingService.loadBookings(true);
    }

    return Promise.resolve();
  };
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(
      routes,
      withRouterConfig({ onSameUrlNavigation: 'reload' })
    ),
    provideHttpClient(withInterceptors([authInterceptor])),
    {
      provide: APP_INITIALIZER,
      useFactory: initApp,
      deps: [EventService, BookingService, AuthService],
      multi: true
    }
  ]
};
