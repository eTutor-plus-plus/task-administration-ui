import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskGroupTypeFormComponent } from '../task-group-type-form.component';

/**
 * Task Group Type Form: OR-View
 */
@Component({
  selector: 'dke-task-group-type-or-view',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    MonacoEditorModule
  ],
  templateUrl: './task-group-type-or-view.component.html',
  styleUrl: './task-group-type-or-view.component.scss'
})
export class TaskGroupTypeOrViewComponent extends TaskGroupTypeFormComponent<TaskGroupTypeForm> {

  /**
   * The editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'sql'
  };

  /**
   * Creates a new instance of class TaskGroupTypeOrViewComponent.
   */
  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl(
      'extensionalSchema',
      new FormControl<string | null>(null, [Validators.required, Validators.minLength(10)])
    );

    this.form.addControl(
      'intensionalSchema',
      new FormControl<string | null>(null, [Validators.required, Validators.minLength(10)])
    );

    this.form.addControl(
      'diagnoseInserts',
      new FormControl<string | null>(null, [Validators.required, Validators.minLength(10)])
    );

    this.form.addControl(
      'submitInserts',
      new FormControl<string | null>(null, [Validators.required, Validators.minLength(10)])
    );
  }
}

interface TaskGroupTypeForm {
  extensionalSchema: FormControl<string | null>;
  intensionalSchema: FormControl<string | null>;
  diagnoseInserts: FormControl<string | null>;
  submitInserts: FormControl<string | null>;
}
