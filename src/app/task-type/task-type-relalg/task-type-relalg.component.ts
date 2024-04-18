import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule } from 'primeng/paginator';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { editor } from 'monaco-editor';

/**
 * Task Type Form: Relational Algebra
 */
@Component({
  selector: 'dke-task-type-relalg',
  standalone: true,
  imports: [
    InputNumberModule,
    MonacoEditorModule,
    PaginatorModule,
    ReactiveFormsModule,
    TranslocoDirective
  ],
  templateUrl: './task-type-relalg.component.html',
  styleUrl: './task-type-relalg.component.scss'
})
export class TaskTypeRelalgComponent extends TaskTypeFormComponent<TaskTypeForm> {
  /**
   * The editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'relalg'
  };

  /**
   * The editor options.
   */
  readonly editorOptionsSql: editor.IStandaloneEditorConstructionOptions = {
    language: 'sql',
    readOnly: true
  };

  /**
   * Creates a new instance of class TaskTypeRelalgComponent.
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

  get sqlSolution(): string | undefined {
    if (!this.originalData)
      return undefined;
    return (this.originalData as any)?.sqlSolution;
  }
}

interface TaskTypeForm {
  solution: FormControl<string | null>;
  wrongOrderPenalty: FormControl<number | null>,
  superfluousColumnsPenalty: FormControl<number | null>
}
