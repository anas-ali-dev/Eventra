import { APP_INITIALIZER } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

export const testProviders = [
  provideHttpClient(),
  provideHttpClientTesting(),
  {
    provide: APP_INITIALIZER,
    multi: true,
    useFactory: () => () => Promise.resolve()
  }
];
