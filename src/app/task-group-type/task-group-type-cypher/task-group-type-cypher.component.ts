import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskGroupTypeFormComponent } from '../task-group-type-form.component';

/**
 * Task Group Type Form: Cypher
 */
@Component({
  selector: 'dke-task-group-type-cypher',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslocoDirective,
    MonacoEditorModule
  ],
  templateUrl: './task-group-type-cypher.component.html',
  styleUrl: './task-group-type-cypher.component.scss'
})
export class TaskGroupTypeCypherComponent extends TaskGroupTypeFormComponent<TaskGroupTypeForm> {

  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'cypher'
  };

  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('setupStatements', new FormControl<string | null>(null, [Validators.required, Validators.minLength(1)]));
    this.form.addControl('secondarySetupStatements', new FormControl<string | null>(null, [Validators.required, Validators.minLength(1)]));
  }
}

interface TaskGroupTypeForm {
  setupStatements: FormControl<string | null>;
  secondarySetupStatements: FormControl<string | null>;
}
