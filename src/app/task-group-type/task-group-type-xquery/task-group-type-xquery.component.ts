import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { editor } from 'monaco-editor';

import { TaskGroupTypeFormComponent } from '../task-group-type-form.component';

/**
 * Task Group Type Form: XQuery
 */
@Component({
  selector: 'dke-task-group-type-xquery',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    MonacoEditorModule
  ],
  templateUrl: './task-group-type-xquery.component.html',
  styleUrl: './task-group-type-xquery.component.scss'
})
export class TaskGroupTypeXqueryComponent extends TaskGroupTypeFormComponent<TaskGroupTypeForm> {

  /**
   * The editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'xml'
  };

  /**
   * Creates a new instance of class TaskGroupTypeXqueryComponent.
   */
  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('diagnoseDocument', new FormControl<string | null>(null, [Validators.required, Validators.minLength(4)]));
    this.form.addControl('submitDocument', new FormControl<string | null>(null, [Validators.required, Validators.minLength(4)]));
  }

}

interface TaskGroupTypeForm {
  diagnoseDocument: FormControl<string | null>;
  submitDocument: FormControl<string | null>;
}
