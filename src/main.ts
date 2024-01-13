import { bootstrapApplication } from '@angular/platform-browser';
import '@angular/common/locales/global/de-AT';

import Quill from 'quill';
import htmlEditButton from 'quill-html-edit-button';

import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

Quill.register({
  'modules/htmlEditButton': htmlEditButton
});

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));
