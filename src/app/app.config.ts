import { ApplicationConfig, importProvidersFrom, InjectionToken, isDevMode, LOCALE_ID } from '@angular/core';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter } from '@angular/router';

import { provideTransloco } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { MessageService } from 'primeng/api';

import { routes } from './app.routes';
import { environment } from '../environments/environment';
import { TranslationLoaderService } from './translation-loader.service';
import { authInterceptor, langInterceptor, unauthorizedInterceptor } from './auth';
import { customizeMonaco } from './monaco';

/**
 * The injection token for the base API URL.
 */
export const API_URL = new InjectionToken<string>('API_URL');

/**
 * The application configuration.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor, langInterceptor, unauthorizedInterceptor])),
    provideAnimations(),
    provideTransloco({
      config: {
        defaultLang: 'en',
        fallbackLang: 'en',
        availableLangs: ['en', 'de'],
        prodMode: !isDevMode(),
        missingHandler: {
          useFallbackTranslation: true,
          logMissingKey: isDevMode()
        },
        flatten: {
          aot: false
        },
        reRenderOnLangChange: true
      },
      loader: TranslationLoaderService
    }),
    importProvidersFrom(MonacoEditorModule.forRoot({
      defaultOptions: {
        scrollBeyondLastLine: false,
        minimap: {enabled: false},
        automaticLayout: true
      },
      onMonacoLoad: customizeMonaco
    })),
    {provide: API_URL, useValue: environment.apiUrl},
    {provide: MessageService},
    {provide: LOCALE_ID, useValue: 'de-AT'}
  ]
};
