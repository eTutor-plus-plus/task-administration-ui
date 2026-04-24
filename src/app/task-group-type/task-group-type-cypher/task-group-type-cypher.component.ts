import { Component } from '@angular/core';
import { AbstractControl, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputNumberModule } from 'primeng/inputnumber';

import { TaskGroupTypeFormComponent } from '../task-group-type-form.component';
import { CypherService } from './cypher.service';

/**
 * Task Group Type Form: Binary Search
 */
@Component({
  selector: 'dke-task-group-type-cypher',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputNumberModule,
    TranslocoDirective,
    InputGroupModule,
    ButtonModule
  ],
  templateUrl: './task-group-type-cypher.component.html',
  styleUrl: './task-group-type-cypher.component.scss'
})
export class TaskGroupTypeCypherComponent extends TaskGroupTypeFormComponent<TaskGroupTypeForm> {

  /**
   * Creates a new instance of class TaskGroupTypeCypherComponent.
   */
  constructor(private readonly cypherService: CypherService) {
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
        controlMax.setErrors({ min: { min: controlMin.value, actual: controlMax.value } });
      }

      return null;
    });
  }

  /**
   * Loads random numbers.
   */
  async loadNumbers(): Promise<void> {
    try {
      this.startLoading();
      const minMax = await this.cypherService.loadNewRandomNumbers();
      this.form.patchValue({
        minNumber: minMax.min,
        maxNumber: minMax.max
      });
    } catch (err) {
    } finally {
      this.finishLoading();
    }
  }
}

interface TaskGroupTypeForm {
  minNumber: FormControl<number | null>;
  maxNumber: FormControl<number | null>;
}
