import { Component } from '@angular/core';
import { TaskTypeFormComponent } from '../task-type-form.component';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { editor } from 'monaco-editor';
import { InputNumberModule } from 'primeng/inputnumber';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { TranslocoDirective } from '@ngneat/transloco';
import { MultiSelectModule } from 'primeng/multiselect';
import { CommonModule } from '@angular/common';
import { Button } from 'primeng/button';

/**
 * Task Type Form: Python
 */
@Component({
  selector: 'dke-task-type-python',
  standalone: true,
  imports: [
    InputNumberModule,
    MonacoEditorModule,
    ReactiveFormsModule,
    TranslocoDirective,
    MultiSelectModule,
    CommonModule,
    Button
  ],
  templateUrl: './task-type-python.component.html',
  styleUrl: './task-type-python.component.scss'
})
export class TaskTypePythonComponent extends TaskTypeFormComponent<TaskTypeForm>{
  /**
   * The editor options.
   *
   * */
  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'python'
  };

  /**
   * Dummy list of libraries.
   * It will later be read from backend.
   * */
  readonly libraryOptions = [
    { label: 'Pandas', value: 'pandas' },
    { label: 'NumPy', value: 'numpy' },
    { label: 'Scikit-learn', value: 'sklearn' },
    { label: 'SciPy', value: 'scipy' },
    { label: 'Matplotlib', value: 'matplotlib' }
  ]

   checks = new FormArray<FormGroup>([])

  /**
   * Creates a new instance of class TaskTypePythonComponent.
   */
  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl("diagnoseData", new FormControl<string | null>("", [Validators.required]));
    this.form.addControl("submitData", new FormControl<string | null>("", [Validators.required]));
    this.form.addControl("packages", new FormControl<string[] | null>([]));
    this.form.addControl("solution", new FormControl<string | null>("", [Validators.required]));
    this.form.addControl("checks", this.checks);
    console.log(this.checks?.controls.length);
    this.addCheck();
  }


  addCheck(): void {
    this.checks.push(new FormGroup({
      name: new FormControl('', Validators.required),
      points: new FormControl(0, Validators.required),
      check: new FormControl('', Validators.required)
    }));
  }

  removeCheck(index: number): void {
    this.checks.removeAt(index);
  }

}

interface TaskTypeForm {
  diagnoseData: FormControl<string | null>;
  submitData: FormControl<string | null>,
  packages: FormControl<string[] | null>,
  solution: FormControl<string | null>,
  checks: FormArray<FormGroup<CheckForm>>
}

interface CheckForm {
  name: FormControl<string | null>;
  points: FormControl<number | null>;
  check: FormControl<string | null>;
}
