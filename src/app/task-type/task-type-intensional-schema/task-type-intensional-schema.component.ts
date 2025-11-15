import { Component, OnChanges, OnDestroy, SimpleChanges } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule } from 'primeng/paginator';

import { TaskTypeFormComponent } from '../task-type-form.component';
import { TaskGroupService } from '../../api';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { InputTextModule } from 'primeng/inputtext';
import { editor } from 'monaco-editor';

/**
 * Task Type Form: Intensional Schema
 */
@Component({
  selector: 'dke-task-type-intensional-schema',
  standalone: true,
  imports: [
    InputNumberModule,
    PaginatorModule,
    ReactiveFormsModule,
    TranslocoDirective,
    EditorComponent,
    InputTextModule
  ],
  templateUrl: './task-type-intensional-schema.component.html',
  styleUrl: './task-type-intensional-schema.component.scss'
})
export class TaskTypeIntensionalSchemaComponent extends TaskTypeFormComponent<TaskTypeForm> implements OnChanges, OnDestroy {

  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'sql'
  };

  private sub?: Subscription;

  /**
   * Creates a new instance of class TaskTypeIntensionalSchemaComponent.
   */
  constructor(private readonly taskGroupService: TaskGroupService) {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('solution', new FormControl<string | null>(null));
    this.form.addControl('tablePoints', new FormControl<number | null>(null));
    this.form.addControl('columnPoints', new FormControl<number | null>(null));
    this.form.addControl('typePoints', new FormControl<number | null>(null));
    this.form.addControl('memberFunctionPoints', new FormControl<number | null>(null));
    this.form.addControl('procedurePoints', new FormControl<number | null>(null));
    this.form.addControl('refPoints', new FormControl<number | null>(null));
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
    if (!taskGroupId) {
      console.info("updateValidator: " + taskGroupId)
      return;
    }

    this.form.controls.solution.clearValidators();
    this.form.controls.solution.addValidators(Validators.required);
    try {
      const tg = await this.taskGroupService.get(taskGroupId);
      if (!tg.additionalData || tg.dto.taskGroupType !== 'intensional-schema')
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
  solution: FormControl<string | null>;
  tablePoints: FormControl<number | null>;
  columnPoints: FormControl<number | null>;
  typePoints: FormControl<number | null>;
  memberFunctionPoints: FormControl<number | null>;
  procedurePoints: FormControl<number | null>;
  refPoints: FormControl<number | null>;
}
