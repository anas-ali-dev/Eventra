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
import { VerifyEmailComponent } from './pages/verify-email/verify-email';
import { ForgotPasswordComponent } from './pages/forgot-password/forgot-password';
import { ResetPasswordComponent } from './pages/reset-password/reset-password';
import { TicketComponent } from './pages/ticket/ticket';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/auth.guard';

export const routes: Routes = [
  { path: '', component: HomeComponent },
  { path: 'login', component: LoginComponent, canActivate: [guestGuard] },
  { path: 'register', component: RegisterComponent, canActivate: [guestGuard] },
  { path: 'verify-email', component: VerifyEmailComponent },
  { path: 'verify-email/:token', component: VerifyEmailComponent },
  { path: 'forgot-password', component: ForgotPasswordComponent, canActivate: [guestGuard] },
  { path: 'reset-password/:token', component: ResetPasswordComponent },
  { path: 'events', component: EventsComponent },
  { path: 'event/:id', component: EventDetailsComponent },
  { path: 'booking', component: BookingComponent, canActivate: [authGuard] },
  { path: 'my-bookings', component: MyBookingsComponent, canActivate: [authGuard] },
  { path: 'ticket/:ref', component: TicketComponent, canActivate: [authGuard] },
  { path: 'profile', component: ProfileComponent, canActivate: [authGuard] },
  { path: '**', component: NotFoundComponent }
];
