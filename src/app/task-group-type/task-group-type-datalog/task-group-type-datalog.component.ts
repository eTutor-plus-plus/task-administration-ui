import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { editor } from 'monaco-editor';

import { TaskGroupTypeFormComponent } from '../task-group-type-form.component';

/**
 * Task Group Type Form: Datalog
 */
@Component({
  selector: 'dke-task-group-type-datalog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    MonacoEditorModule
  ],
  templateUrl: './task-group-type-datalog.component.html',
  styleUrl: './task-group-type-datalog.component.scss'
})
export class TaskGroupTypeDatalogComponent extends TaskGroupTypeFormComponent<TaskGroupTypeForm> {
  /**
   * The editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'datalog'
  };

  /**
   * Creates a new instance of class TaskGroupTypeDatalogComponent.
   */
  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('diagnoseFacts', new FormControl<string | null>(null, [Validators.required, Validators.minLength(4)]));
    this.form.addControl('submissionFacts', new FormControl<string | null>(null, [Validators.required, Validators.minLength(4)]));
  }
}

interface TaskGroupTypeForm {
  diagnoseFacts: FormControl<string | null>;
  submissionFacts: FormControl<string | null>;
}
