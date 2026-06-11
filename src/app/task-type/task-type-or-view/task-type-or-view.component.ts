import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';

import { TaskTypeFormComponent } from '../task-type-form.component';
import { registerOrViewLanguage } from '../../monaco/or-view';
import { TranslocoDirective } from '@ngneat/transloco';

@Component({
  selector: 'dke-task-type-or-view',
  standalone: true,
  imports: [
    MonacoEditorModule,
    ReactiveFormsModule,
    TranslocoDirective,
    CheckboxModule,
    InputNumberModule
  ],
  templateUrl: './task-type-or-view.component.html',
  styleUrl: './task-type-or-view.component.scss'
})
export class TaskTypeOrViewsComponent extends TaskTypeFormComponent<TaskTypeForm> {

  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'orview',
    automaticLayout: true,
    minimap: { enabled: false }
  };

  constructor() {
    super();
    registerOrViewLanguage();
  }

  protected override initForm() {

    this.form.addControl(
      'hasUnderSuperview',
      new FormControl<boolean>(false, { nonNullable: true })
    );

    this.form.addControl(
      'hasRefSuperview',
      new FormControl<boolean>(false, { nonNullable: true })
    );

    this.form.addControl(
      'underSuperview',
      new FormControl<string | null>(null)
    );

    this.form.addControl(
      'refSuperview',
      new FormControl<string | null>(null)
    );

    this.form.addControl(
      'solution',
      new FormControl<string | null>(null, [Validators.required])
    );

    this.form.addControl(
      'testQuery',
      new FormControl<string | null>(null, [Validators.required])
    );

    this.form.addControl(
      'missingPrimitiveFieldPenalty',
      new FormControl<number | null>(null)
    );

    this.form.addControl(
      'missingObjectFieldPenalty',
      new FormControl<number | null>(null)
    );

    this.form.addControl(
      'missingNestedTablePenalty',
      new FormControl<number | null>(null)
    );

    this.form.addControl(
      'wrongNestedTableTypePenalty',
      new FormControl<number | null>(null)
    );

    this.form.addControl(
      'wrongViewObjectTypePenalty',
      new FormControl<number | null>(null)
    );

    this.form.addControl(
      'wrongOidPenalty',
      new FormControl<number | null>(null)
    );

    this.form.addControl(
      'wrongContentPenalty',
      new FormControl<number | null>(null)
    );

    this.form.addControl(
      'wrongColumnOrderPenalty',
      new FormControl<number | null>(null)
    );

    this.form.addControl(
      'wrongSuperviewPenalty',
      new FormControl<number | null>(null)
    );

    const underCtrl = this.form.get('underSuperview');
    const refCtrl = this.form.get('refSuperview');

    const hasUnderSuperviewCtrl = this.form.get('hasUnderSuperview');
    const hasRefCtrl = this.form.get('hasRefSuperview');

    if (underCtrl?.value) {
      hasUnderSuperviewCtrl?.setValue(true, { emitEvent: false });
      underCtrl.setValidators([Validators.required]);
    }

    if (refCtrl?.value) {
      hasRefCtrl?.setValue(true, { emitEvent: false });
      refCtrl.setValidators([Validators.required]);
    }

    hasUnderSuperviewCtrl?.valueChanges.subscribe((checked) => {
      if (checked) {
        underCtrl?.setValidators([Validators.required]);
      } else {
        underCtrl?.clearValidators();
        underCtrl?.setValue(null);
      }
      underCtrl?.updateValueAndValidity();
    });

    hasRefCtrl?.valueChanges.subscribe((checked) => {
      if (checked) {
        refCtrl?.setValidators([Validators.required]);
      } else {
        refCtrl?.clearValidators();
        refCtrl?.setValue(null);
      }
      refCtrl?.updateValueAndValidity();
    });
  }

  protected override onOriginalDataChanged(originalData: unknown | undefined): void {

    const data: any = originalData;

    if (!this.form) return;

    const underCtrl = this.form.get('underSuperview');
    const refCtrl = this.form.get('refSuperview');

    const hasUnderSuperviewCtrl = this.form.get('hasUnderSuperview');
    const hasRefCtrl = this.form.get('hasRefSuperview');

    if (data?.underSuperview) {
      hasUnderSuperviewCtrl?.setValue(true, { emitEvent: false });
      underCtrl?.setValue(data.underSuperview, { emitEvent: false });
      underCtrl?.setValidators([Validators.required]);
    } else {
      hasUnderSuperviewCtrl?.setValue(false, { emitEvent: false });
      underCtrl?.setValue(null, { emitEvent: false });
      underCtrl?.clearValidators();
    }

    if (data?.refSuperview) {
      hasRefCtrl?.setValue(true, { emitEvent: false });
      refCtrl?.setValue(data.refSuperview, { emitEvent: false });
      refCtrl?.setValidators([Validators.required]);
    } else {
      hasRefCtrl?.setValue(false, { emitEvent: false });
      refCtrl?.setValue(null, { emitEvent: false });
      refCtrl?.clearValidators();
    }

    underCtrl?.updateValueAndValidity();
    refCtrl?.updateValueAndValidity();

    this.form.get('missingPrimitiveFieldPenalty')?.setValue(data?.missingPrimitiveFieldPenalty ?? null, { emitEvent: false });
    this.form.get('missingObjectFieldPenalty')?.setValue(data?.missingObjectFieldPenalty ?? null, { emitEvent: false });
    this.form.get('missingNestedTablePenalty')?.setValue(data?.missingNestedTablePenalty ?? null, { emitEvent: false });
    this.form.get('wrongNestedTableTypePenalty')?.setValue(data?.wrongNestedTableTypePenalty ?? null, { emitEvent: false });
    this.form.get('wrongViewObjectTypePenalty')?.setValue(data?.wrongViewObjectTypePenalty ?? null, { emitEvent: false });
    this.form.get('wrongOidPenalty')?.setValue(data?.wrongOidPenalty ?? null, { emitEvent: false });
    this.form.get('wrongContentPenalty')?.setValue(data?.wrongContentPenalty ?? null, { emitEvent: false });
    this.form.get('wrongColumnOrderPenalty')?.setValue(data?.wrongColumnOrderPenalty ?? null, { emitEvent: false });
    this.form.get('wrongSuperviewPenalty')?.setValue(data?.wrongSuperviewPenalty ?? null, { emitEvent: false });
  }
}

interface TaskTypeForm {
  hasUnderSuperview: FormControl<boolean>;
  hasRefSuperview: FormControl<boolean>;
  underSuperview: FormControl<string | null>;
  refSuperview: FormControl<string | null>;
  solution: FormControl<string | null>;
  testQuery: FormControl<string | null>;
  missingPrimitiveFieldPenalty: FormControl<number | null>;
  missingObjectFieldPenalty: FormControl<number | null>;
  missingNestedTablePenalty: FormControl<number | null>;
  wrongNestedTableTypePenalty: FormControl<number | null>;
  wrongViewObjectTypePenalty: FormControl<number | null>;
  wrongOidPenalty: FormControl<number | null>;
  wrongContentPenalty: FormControl<number | null>;
  wrongColumnOrderPenalty: FormControl<number | null>;
  wrongSuperviewPenalty: FormControl<number | null>;
}
