import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeFormComponent } from '../task-type-form.component';

/**
 * Task Type Form: Datalog
 */
@Component({
  selector: 'dke-task-type-asp',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    MonacoEditorModule,
    DropdownModule,
    InputNumberModule
  ],
  templateUrl: './task-type-asp.component.html',
  styleUrl: './task-type-asp.component.scss'
})
export class TaskTypeAspComponent extends TaskTypeFormComponent<TaskTypeForm> {
  /**
   * The XQuery editor options.
   */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'datalog'
  };

  /**
   * Creates a new instance of class TaskTypeAspComponent.
   */
  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('solution', new FormControl<string | null>(null, [Validators.required]));
    this.form.addControl('maxN', new FormControl<number | null>(null, [Validators.min(1)]));
  }
}

interface TaskTypeForm {
  solution: FormControl<string | null>;
  maxN: FormControl<number | null>;
}
