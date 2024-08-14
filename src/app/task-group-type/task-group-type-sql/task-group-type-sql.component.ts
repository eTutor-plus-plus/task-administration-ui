import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskGroupTypeFormComponent } from '../task-group-type-form.component';

/**
 * Task Group Type Form: SQL
 */
@Component({
  selector: 'dke-task-group-type-sql',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    MonacoEditorModule
  ],
  templateUrl: './task-group-type-sql.component.html',
  styleUrl: './task-group-type-sql.component.scss'
})
export class TaskGroupTypeSqlComponent extends TaskGroupTypeFormComponent<TaskGroupTypeForm> {

  /**
   * The editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'sql'
  };

  /**
   * Creates a new instance of class TaskGroupTypeXqueryComponent.
   */
  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('ddlStatements', new FormControl<string | null>(null, [Validators.required, Validators.minLength(10)]));
    this.form.addControl('diagnoseDmlStatements', new FormControl<string | null>(null, [Validators.required, Validators.minLength(10)]));
    this.form.addControl('submitDmlStatements', new FormControl<string | null>(null, [Validators.required, Validators.minLength(10)]));
  }
}

interface TaskGroupTypeForm {
  ddlStatements: FormControl<string | null>;
  diagnoseDmlStatements: FormControl<string | null>;
  submitDmlStatements: FormControl<string | null>;
}
