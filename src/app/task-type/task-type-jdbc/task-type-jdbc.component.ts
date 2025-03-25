import { Component, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule } from 'primeng/paginator';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { editor } from 'monaco-editor';

import { TaskTypeFormComponent } from '../task-type-form.component';
import { TaskGroupService } from '../../api';

/**
 * Task Type Form: Binary Search
 */
@Component({
  selector: 'dke-task-type-jdbc',
  standalone: true,
  imports: [
    InputNumberModule,
    MonacoEditorModule,
    PaginatorModule,
    ReactiveFormsModule,
    TranslocoDirective
  ],
  templateUrl: './task-type-jdbc.component.html',
  styleUrl: './task-type-jdbc.component.scss'
})
export class TaskTypeJDBCComponent extends TaskTypeFormComponent<TaskTypeForm> implements OnChanges, OnDestroy {

  /**
   * The editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'java'
  };

  private sub?: Subscription;

  /**
   * Creates a new instance of class TaskTypeJDBCComponent.
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
      if (!tg.additionalData || tg.dto.taskGroupType !== 'jdbc')
        return;

      const min = tg.additionalData['minNumber'] as number;
      const max = tg.additionalData['maxNumber'] as number;
      this.form.controls.solution.addValidators(Validators.min(min));
      this.form.controls.solution.addValidators(Validators.max(max));
      this.form.controls.solution.updateValueAndValidity();
    } catch (err) {
      // ignore
    }
  }

}

interface TaskTypeForm {
  solution: FormControl<number | null>;
}
