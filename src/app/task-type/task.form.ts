import { FormArray, FormControl, UntypedFormGroup } from '@angular/forms';
import { StatusEnum } from '../api';

/**
 * Form for tasks.
 */
export interface TaskForm {
  organizationalUnitId: FormControl<number | null>;
  title: FormControl<string | null>;
  descriptionDe: FormControl<string | null>;
  descriptionEn: FormControl<string | null>;
  difficulty: FormControl<number | null>;
  maxPoints: FormControl<number | null>;
  taskType: FormControl<string | null>;
  status: FormControl<StatusEnum | null>;
  taskGroupId: FormControl<number | null>;
  taskCategoryIds: FormArray<FormControl<number | null>>;
  additionalData: UntypedFormGroup;
}
