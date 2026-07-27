import { HttpErrorResponse } from '@angular/common/http';

export function getApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) {
      return err.error?.message
        || 'Cannot reach the server. Start the backend with: cd Backend && npm run dev';
    }

    if (typeof err.error?.message === 'string') {
      return err.error.message;
    }
  }

  return fallback;
}
