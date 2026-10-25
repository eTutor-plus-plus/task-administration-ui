import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { CheckboxModule } from 'primeng/checkbox';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeFormComponent } from '../task-type-form.component';

interface TaskTypeForm {
  allowGrading: FormControl<boolean | null>;
  checkNames: FormControl<boolean | null>;
  solution: FormControl<string | null>;
}

@Component({
  selector: 'dke-task-type-dfm',
  standalone: true,
  imports: [CheckboxModule, MonacoEditorModule, ReactiveFormsModule, TranslocoDirective],
  templateUrl: './task-type-dfm.component.html',
  styleUrl: './task-type-dfm.component.scss'
})
export class TaskTypeDfmComponent extends TaskTypeFormComponent<TaskTypeForm> {

  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'plaintext',
    minimap: {enabled: false},
    scrollBeyondLastLine: false,
    wordWrap: 'on'
  };

  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('allowGrading', new FormControl<boolean>(false));
    this.form.addControl('checkNames', new FormControl<boolean>(false));
    this.form.addControl('solution', new FormControl<string | null>(null, [Validators.required]));
  }
}
