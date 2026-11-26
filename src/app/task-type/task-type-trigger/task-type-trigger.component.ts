import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { InputNumberModule } from 'primeng/inputnumber';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeFormComponent } from '../task-type-form.component';

/**
 * Task Type Form: trigger
 */
@Component({
  selector: 'dke-task-type-trigger',
  standalone: true,
  imports: [
    InputNumberModule,
    MonacoEditorModule,
    ReactiveFormsModule,
    TranslocoDirective
  ],
  templateUrl: './task-type-trigger.component.html',
  styleUrl: './task-type-trigger.component.scss'
})
export class TaskTypeTriggerComponent extends TaskTypeFormComponent<TaskTypeForm> {
  /**
   * The editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'sql'
  };

  /**
   * Creates a new instance of class TaskTypeSqlComponent.
   */
  constructor() {
    super();
  }

  protected override initForm() {
    this.form.addControl('solution', new FormControl<string | null>(null, [Validators.required]));
    this.form.addControl('triggerOperations', new FormControl<string | null>(null, [Validators.required]));
    this.form.addControl('resultTables', new FormControl<string | null>(null, [Validators.required]));
    this.form.addControl('wrongHeadPenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(-1)]));
    this.form.addControl('wrongBodyPenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(-0.75)]));
    this.form.addControl('timingIndependent', new FormControl<string | null>(null, [Validators.required]));
    this.form.addControl('buffered', new FormControl<string | null>(null, [Validators.required]));
    this.form.addControl('comparisonExecution', new FormControl<string | null>(null, [Validators.required]));
  }

  protected override getFormDefaultValues(): Partial<{ [K in keyof TaskTypeForm]: any }> | undefined {
    return {
      timingIndependent: false,
      buffered: true,
      comparisonExecution: false,
      wrongHeadPenalty: -1,
      wrongBodyPenalty: -0.75
    };
  }
}

interface TaskTypeForm {
  solution: FormControl<string | null>,
  triggerOperations: FormControl<string | null>,
  resultTables : FormControl<string | null>,
  timingIndependent: FormControl<string | null>,
  buffered: FormControl<string | null>,
  comparisonExecution: FormControl<string | null>,
  wrongHeadPenalty: FormControl<number | null>,
  wrongBodyPenalty: FormControl<number | null>
}
