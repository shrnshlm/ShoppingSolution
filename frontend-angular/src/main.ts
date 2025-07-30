import 'zone.js';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http'; // Add this line
import { App } from './app/app';
import { routes } from './app/app.routes';

bootstrapApplication(App, {
  providers: [
    provideRouter(routes),
    provideHttpClient() // Add this line
  ]
});