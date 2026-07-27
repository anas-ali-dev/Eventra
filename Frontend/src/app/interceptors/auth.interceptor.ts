import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { timeout, catchError, throwError } from 'rxjs';

import { AuthService } from '../services/auth.service';

const REQUEST_TIMEOUT_MS = 8000;

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const token = auth.getAccessToken();

  if (token) {
    req = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` }
    });
  }

  return next(req).pipe(
    timeout(REQUEST_TIMEOUT_MS),
    catchError((err: unknown) => {
      if (err instanceof HttpErrorResponse) {
        return throwError(() => err);
      }

      // timeout or network failure
      return throwError(() =>
        new HttpErrorResponse({
          error: {
            message: 'Cannot reach the server. Make sure the backend is running on port 5000.'
          },
          status: 0,
          statusText: 'Connection failed'
        })
      );
    })
  );
};
