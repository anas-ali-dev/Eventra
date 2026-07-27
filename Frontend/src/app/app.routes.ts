import { Routes } from '@angular/router';

import { HomeComponent } from './pages/home/home';
import { LoginComponent } from './pages/login/login';
import { RegisterComponent } from './pages/register/register';
import { EventsComponent } from './pages/events/events';
import { EventDetailsComponent } from './pages/event-details/event-details';
import { BookingComponent } from './pages/booking/booking';
import { MyBookingsComponent } from './pages/my-bookings/my-bookings';
import { ProfileComponent } from './pages/profile/profile';
import { NotFoundComponent } from './pages/not-found/not-found';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'events', component: EventsComponent },
  { path: 'event/:id', component: EventDetailsComponent },
  { path: 'booking', component: BookingComponent, canActivate: [authGuard] },
  { path: 'my-bookings', component: MyBookingsComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent }
];
