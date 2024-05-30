import { TestBed } from '@angular/core/testing';

import { TranslationLoaderService } from './translation-loader.service';

describe('TranslationLoaderService', () => {
  let service: TranslationLoaderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(TranslationLoaderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should load the translations', async () => {
    const translations = await service.getTranslation('en')
    expect(translations).toBeTruthy();
  });

});
