import { FormControl, UntypedFormGroup } from '@angular/forms';
import { StatusEnum } from '../api';

/**
 * Form for task groups.
 */
export interface TaskGroupForm {
  name: FormControl<string | null>;
  descriptionDe: FormControl<string | null>;
  descriptionEn: FormControl<string | null>;
  taskGroupType: FormControl<string | null>;
  status: FormControl<StatusEnum | null>;
  organizationalUnitId: FormControl<number | null>;
  additionalData: UntypedFormGroup;
}
