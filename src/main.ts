import { bootstrapApplication } from '@angular/platform-browser';
import '@angular/common/locales/global/de-AT';

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

import Quill from 'quill';
import htmlEditButton from 'quill-html-edit-button';

Quill.register({
  'modules/htmlEditButton': htmlEditButton
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
