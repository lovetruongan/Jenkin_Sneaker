import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserModule } from "@angular/platform-browser"; 
import { routes } from './app.routes';
import { provideClientHydration } from '@angular/platform-browser';
import { HTTP_INTERCEPTORS, HttpClientModule, provideHttpClient, withFetch, withInterceptorsFromDi } from '@angular/common/http';
import { ChartModule } from 'primeng/chart';
import { CardModule } from 'primeng/card';
import { TabViewModule } from 'primeng/tabview';
import { CalendarModule } from 'primeng/calendar';
import { FormsModule } from '@angular/forms';
import { AuthInterceptor } from './features/auth/authInterceptor/auth.interceptor';
import { MessageService, ConfirmationService } from 'primeng/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes), 
    provideClientHydration(), 
    provideHttpClient(withFetch(), withInterceptorsFromDi()),
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    MessageService,
    ConfirmationService,
    importProvidersFrom(
      BrowserModule,
      BrowserAnimationsModule,
      ChartModule,
      CardModule,
      TabViewModule,
      CalendarModule,
      FormsModule
    ),
  ]
};
