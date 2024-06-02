import { TestBed } from '@angular/core/testing';
import { FormControl } from '@angular/forms';
import { TranslocoService, TranslocoTestingModule } from '@ngneat/transloco';

import { getValidationErrorMessage } from './validation.helper';


describe('validation.helper', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslocoTestingModule.forRoot({})]
    });
  });

  it('should return the validation message for the specified form control', () => {
    // Arrange
    const fieldTranslationKey = 'fieldTranslationKey';
    const expected = 'en.validation.required ';
    const translationService = TestBed.inject(TranslocoService);
    const control: FormControl = <any>{
      errors: {
        required: true
      }
    };

    // Act
    const result = getValidationErrorMessage(translationService, control, fieldTranslationKey);

    // Assert
    expect(result).toEqual(expected);
  });

  it('should return the concatenated validation messages for the specified form control', () => {
    // Arrange
    const fieldTranslationKey = 'fieldTranslationKey';
    const expected = 'en.validation.required en.validation.minLength ';
    const translationService = TestBed.inject(TranslocoService);
    const control: FormControl = <any>{
      errors: {
        required: true,
        minLength: true
      }
    };

    // Act
    const result = getValidationErrorMessage(translationService, control, fieldTranslationKey);

    // Assert
    expect(result).toEqual(expected);
  });
});
