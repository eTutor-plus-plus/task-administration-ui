import { Component, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { distinctUntilChanged, Subscription } from 'rxjs';

import { TaskTypeFormComponent } from '../task-type-form.component';
import { TaskGroupService } from '../../api';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule } from 'primeng/paginator';
import { TranslocoDirective } from '@ngneat/transloco';

/**
 * Task Type Form: Binary Search
 */
@Component({
  selector: 'dke-task-type-binary-search',
  standalone: true,
  imports: [
    InputNumberModule,
    PaginatorModule,
    ReactiveFormsModule,
    TranslocoDirective
  ],
  templateUrl: './task-type-binary-search.component.html',
  styleUrl: './task-type-binary-search.component.scss'
})
export class TaskTypeBinarySearchComponent extends TaskTypeFormComponent<TaskTypeForm> implements OnChanges, OnDestroy {

  private sub?: Subscription;

  /**
   * Creates a new instance of class TaskTypeBinarySearchComponent.
   */
  constructor(private readonly taskGroupService: TaskGroupService) {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('solution', new FormControl<number | null>(null, [Validators.required]));
  }

  /**
   * Listens to input changes.
   *
   * @param changes The changes.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!('parentForm' in changes))
      return;

    this.sub?.unsubscribe();
    this.sub = changes['parentForm'].currentValue.controls.taskGroupId.valueChanges
      .pipe(distinctUntilChanged()).subscribe((val: number | null) => this.updateValidator(val));
  }

  /**
   * Unsubscribes from all subscriptions.
   */
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private async updateValidator(taskGroupId: number | null): Promise<void> {
    if (!taskGroupId)
      return;

    this.form.controls.solution.clearValidators();
    this.form.controls.solution.addValidators(Validators.required);
    try {
      const tg = await this.taskGroupService.get(taskGroupId);
      if (!tg.additionalData)
        return;

      this.form.controls.solution.addValidators(Validators.min(tg.additionalData['minNumber'] as number));
      this.form.controls.solution.addValidators(Validators.max(tg.additionalData['maxNumber'] as number));
    } catch (err) {
      // ignore
    }
  }

}

interface TaskTypeForm {
  solution: FormControl<number | null>;
}
