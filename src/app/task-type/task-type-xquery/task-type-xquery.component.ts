import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeFormComponent } from '../task-type-form.component';

/**
 * Task Type Form: XQuery
 */
@Component({
  selector: 'dke-task-type-xquery',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    MonacoEditorModule
  ],
  templateUrl: './task-type-xquery.component.html',
  styleUrl: './task-type-xquery.component.scss'
})
export class TaskTypeXqueryComponent extends TaskTypeFormComponent<TaskTypeForm> {
  /**
   * The XQuery editor options.
   */
  readonly editorOptionsXQ: editor.IStandaloneEditorConstructionOptions = {
    language: 'xquery'
  };

  /**
   * The XPath editor options.
   */
  readonly editorOptionsXP: editor.IStandaloneEditorConstructionOptions = {
    language: 'xpath'
  };

  /**
   * Creates a new instance of class TaskTypeXqueryComponent.
   */
  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('solution', new FormControl<string | null>(null, [Validators.required]));
    this.form.addControl('sorting', new FormControl<string | null>(null));
  }
}

interface TaskTypeForm {
  solution: FormControl<string | null>;
  sorting: FormControl<string | null>;
}
