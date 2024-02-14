import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeFormComponent } from '../task-type-form.component';

/**
 * Task Type Form: Datalog
 */
@Component({
  selector: 'dke-task-type-datalog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    MonacoEditorModule
  ],
  templateUrl: './task-type-datalog.component.html',
  styleUrl: './task-type-datalog.component.scss'
})
export class TaskTypeDatalogComponent extends TaskTypeFormComponent<TaskTypeForm>{
  /**
   * The XQuery editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'datalog'
  };

  /**
   * Creates a new instance of class TaskTypeDatalogComponent.
   */
  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('solution', new FormControl<string | null>(null, [Validators.required]));
    this.form.addControl('query', new FormControl<string | null>(null, [Validators.required]));
    this.form.addControl('uncheckedTerms', new FormControl<string | null>(null));
  }
}

interface TaskTypeForm {
  solution: FormControl<string | null>;
  query: FormControl<string | null>;
  uncheckedTerms: FormControl<string | null>;
}
