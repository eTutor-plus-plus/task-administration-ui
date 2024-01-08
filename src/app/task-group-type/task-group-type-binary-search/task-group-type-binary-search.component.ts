import { Component } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { InputNumberModule } from 'primeng/inputnumber';

import { TaskGroupTypeFormComponent } from '../task-group-type-form.component';

/**
 * Task Group Type Form: Binary Search
 */
@Component({
  selector: 'dke-task-group-type-binary-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputNumberModule,
    TranslocoDirective
  ],
  templateUrl: './task-group-type-binary-search.component.html',
  styleUrl: './task-group-type-binary-search.component.scss'
})
export class TaskGroupTypeBinarySearchComponent extends TaskGroupTypeFormComponent<TaskGroupTypeForm> {

  /**
   * Creates a new instance of class TaskGroupTypeBinarySearchComponent.
   */
  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('minNumber', new FormControl<number | null>(null, [Validators.required]));
    this.form.addControl('maxNumber', new FormControl<number | null>(null, [Validators.required]));
    this.form.addValidators((group: AbstractControl<TaskGroupTypeForm>) => {
      const controlMin = group.get('minNumber');
      const controlMax = group.get('maxNumber');
      if (!controlMin || !controlMax)
        return null;

      if (controlMin.value > controlMax.value) {
        controlMax.setErrors({min: {min: controlMin.value, actual: controlMax.value}});
      }

      return null;
    });
  }

}

interface TaskGroupTypeForm {
  minNumber: FormControl<number | null>;
  maxNumber: FormControl<number | null>;
}
