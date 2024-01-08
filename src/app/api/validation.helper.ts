import { FormControl } from '@angular/forms';
import { TranslocoService } from '@ngneat/transloco';

/**
 * Returns the validation message for the specified form control.
 *
 * @param translationService The translation service.
 * @param control The form control.
 * @param fieldTranslationKey
 */
export function getValidationErrorMessage(translationService: TranslocoService, control: FormControl, fieldTranslationKey: string): string {
  const errors = control.errors;
  if (!errors)
    return '';

  let msg = '';
  for (const k of Object.keys(errors)) {
    msg += translationService.translate('validation.' + k, {
      field: translationService.translate(fieldTranslationKey),
      ...errors[k]
    });
    msg += ' ';
  }
  return msg;
}
