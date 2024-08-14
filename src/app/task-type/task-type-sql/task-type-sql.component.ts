import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { InputNumberModule } from 'primeng/inputnumber';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeFormComponent } from '../task-type-form.component';

/**
 * Task Type Form: SQL
 */
@Component({
  selector: 'dke-task-type-sql',
  standalone: true,
  imports: [
    InputNumberModule,
    MonacoEditorModule,
    ReactiveFormsModule,
    TranslocoDirective
  ],
  templateUrl: './task-type-sql.component.html',
  styleUrl: './task-type-sql.component.scss'
})
export class TaskTypeSqlComponent extends TaskTypeFormComponent<TaskTypeForm> {
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
    this.form.addControl('wrongOrderPenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(-1)]));
    this.form.addControl('superfluousColumnsPenalty', new FormControl<number | null>(null, [Validators.required, Validators.min(-1)]));
  }

  protected override getFormDefaultValues(): Partial<{ [K in keyof TaskTypeForm]: any }> | undefined {
    return {
      wrongOrderPenalty: -1,
      superfluousColumnsPenalty: -1
    };
  }
}

interface TaskTypeForm {
  solution: FormControl<string | null>;
  wrongOrderPenalty: FormControl<number | null>,
  superfluousColumnsPenalty: FormControl<number | null>
}
