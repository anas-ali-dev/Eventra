import { HttpErrorResponse } from '@angular/common/http';

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return err.error?.message
        || 'Cannot reach the server. Start the backend with: cd Backend && npm run dev';
    }

    if (err.status === 408 || err.message?.includes('Timeout')) {
      return 'The server is taking too long. Check your connection and try again.';
    }

    if (err.status === 401) {
      return err.error?.message || 'Your session expired. Please log in again.';
    }

    if (typeof err.error?.message === 'string') {
      return err.error.message;
    }
  }

  return fallback;
}
