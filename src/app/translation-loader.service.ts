import { Injectable } from '@angular/core';

import { Observable } from 'rxjs';
import { Translation, TranslocoLoader } from '@ngneat/transloco';

import * as coreEn from '../i18n/core-en.json';
import * as coreDe from '../i18n/core-de.json';
import * as dataEn from '../i18n/data-en.json';
import * as dataDe from '../i18n/data-de.json';
import * as taskTypeEn from '../i18n/task-types-en.json';
import * as taskTypeDe from '../i18n/task-types-de.json';
import * as taskGroupTypeEn from '../i18n/task-group-types-en.json';
import * as taskGroupTypeDe from '../i18n/task-group-types-de.json';

/**
 * Includes translations at build time.
 */
@Injectable({providedIn: 'root'})
export class TranslationLoaderService implements TranslocoLoader {

  private readonly translations: { [lang: string]: Translation };

  /**
   * Creates a new instance of class TranslationLoaderService.
   */
  constructor() {
    this.translations = {
      'en': {
        ...coreEn,
        ...dataEn,
        ...taskTypeEn,
        ...taskGroupTypeEn
      },
      'de': {
        ...coreDe,
        ...dataDe,
        ...taskTypeDe,
        ...taskGroupTypeDe
      }
    };
  }

  /**
   * Loads the translations.
   * @param lang The requested language.
   */
  getTranslation(lang: string): Observable<Translation> | Promise<Translation> {
    return new Promise<Translation>(resolve => {
      resolve(this.translations[lang]);
    });
  }

}
