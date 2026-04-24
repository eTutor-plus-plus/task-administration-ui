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

  readonly allowedLibraries: string[] = [
    'pandas',
    'numpy',
    'matplotlib',
    'scipy',
    'sklearn'
  ];

  checks = new FormArray<FormGroup<CheckForm>>([]);

  /**
   * Creates a new instance of class TaskTypePythonComponent.
   */
  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl("imports", new FormControl<string | null>(""))
    this.form.addControl("diagnoseData", new FormControl<string | null>("", [Validators.required]));
    this.form.addControl("submitData", new FormControl<string | null>("", [Validators.required]));
    this.form.addControl("solution", new FormControl<string | null>("", [Validators.required]));
    this.form.addControl("checks", this.checks);

    this.form.valueChanges.subscribe(() => {
      this.validateCheckPointsSum();
    });
  }

  addCheck(): void {
    this.checks.push(this.createCheck());
    this.validateCheckPointsSum();
  }

  removeCheck(index: number): void {
    this.checks.removeAt(index);
    this.validateCheckPointsSum();
  }

  protected override onOriginalDataChanged(originalData: any): void {
    this.checks.clear();

    if (originalData?.checks?.length) {
      originalData.checks.forEach((c: any) => {
        this.checks.push(this.createCheck(c));
      });
    } else {
      this.addCheck();
    }

    this.validateCheckPointsSum();
  }

  private validateCheckPointsSum(): void {
    const checks = this.checks.controls;

    const maxPoints = this.parentForm?.controls?.maxPoints?.value;

    if (maxPoints == null) {
      this.form.setErrors(null);
      return;
    }

    const allZero = checks.every(c => (c.value.points ?? 0) === 0);
    if (allZero) {
      this.form.setErrors(null);
      return;
    }

    const sum = checks.reduce((acc, c) => acc + (c.value.points ?? 0), 0);

    const errors = this.form.errors || {};

    if (sum !== maxPoints) {
      errors['pointsMismatch'] = true;
    } else {
      delete errors['pointsMismatch'];
    }

    this.form.setErrors(Object.keys(errors).length ? errors : null);
  }

  createCheck(c?: any): FormGroup<CheckForm> {
    return new FormGroup<CheckForm>({
      name: new FormControl(c?.name ?? '', { nonNullable: true, validators: [Validators.required] }),
      points: new FormControl(c?.points ?? 0, { nonNullable: true, validators: [Validators.required] }),
      check: new FormControl(c?.check ?? '', { nonNullable: true, validators: [Validators.required] })
    });
  }

  showPointsMismatch(): boolean {
    return !!this.form.errors?.['pointsMismatch'];
  }

}

interface TaskTypeForm {
  imports: FormControl<string | null>;
  diagnoseData: FormControl<string | null>;
  submitData: FormControl<string | null>,
  solution: FormControl<string | null>,
  checks: FormArray<FormGroup<CheckForm>>
}

interface CheckForm {
  name: FormControl<string | null>;
  points: FormControl<number | null>;
  check: FormControl<string | null>;
}
