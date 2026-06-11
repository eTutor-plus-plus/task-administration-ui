import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe, TranslocoService } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { SelectButtonModule } from 'primeng/selectbutton';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeFormComponent } from '../task-type-form.component';

export type CypherEvaluationMode = 'PENALTY' | 'MULTI_SOLUTION';

export interface AlternativeSolutionForm {
  solution: FormControl<string | null>;
  pointsPercent: FormControl<number | null>;
}

interface TaskTypeForm {
  evaluationMode: FormControl<CypherEvaluationMode | null>;
  solution: FormControl<string | null>;
  superfluousColumnsPenalty: FormControl<number | null>;
  missingRowsPenalty: FormControl<number | null>;
  superfluousRowsPenalty: FormControl<number | null>;
  wrongOrderPenalty: FormControl<number | null>;
  expectedColumnNames: FormControl<string | null>;
  alternativeSolutions: FormArray<FormGroup<AlternativeSolutionForm>>;
}

/**
 * Task Type Form: Cypher
 */
@Component({
  selector: 'dke-task-type-cypher',
  standalone: true,
  imports: [
    ButtonModule,
    InputNumberModule,
    InputTextModule,
    MonacoEditorModule,
    ReactiveFormsModule,
    SelectButtonModule,
    TranslocoDirective,
    TranslocoPipe
  ],
  templateUrl: './task-type-cypher.component.html',
  styleUrl: './task-type-cypher.component.scss'
})
export class TaskTypeCypherComponent extends TaskTypeFormComponent<TaskTypeForm> {

  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'cypher'
  };

  readonly modeOptions: { label: string; value: CypherEvaluationMode }[];

  constructor() {
    super();
    this.modeOptions = [
      { label: this.translationService.translate('taskTypes.cypher.fields.evaluationMode.PENALTY'), value: 'PENALTY' },
      { label: this.translationService.translate('taskTypes.cypher.fields.evaluationMode.MULTI_SOLUTION'), value: 'MULTI_SOLUTION' }
    ];
  }

  protected override initForm(): void {
    const percent = [Validators.required, Validators.min(0), Validators.max(100)];
    this.form.addControl('evaluationMode', new FormControl<CypherEvaluationMode | null>('PENALTY', Validators.required));
    this.form.addControl('solution', new FormControl<string | null>(null));
    this.form.addControl('superfluousColumnsPenalty', new FormControl<number | null>(null, percent));
    this.form.addControl('missingRowsPenalty', new FormControl<number | null>(null, percent));
    this.form.addControl('superfluousRowsPenalty', new FormControl<number | null>(null, percent));
    this.form.addControl('wrongOrderPenalty', new FormControl<number | null>(null, percent));
    this.form.addControl('expectedColumnNames', new FormControl<string | null>(null));
    this.form.addControl('alternativeSolutions', new FormArray<FormGroup<AlternativeSolutionForm>>(
      [],
      multiSolutionListValidator(() => this.form.controls.evaluationMode.value)
    ));

    this.form.controls.evaluationMode.valueChanges.subscribe(() => this.applyConditionalValidators());
    this.applyConditionalValidators();
  }

  protected override getFormDefaultValues(): Partial<{ [K in keyof TaskTypeForm]: any }> | undefined {
    return {
      evaluationMode: 'PENALTY',
      superfluousColumnsPenalty: 100,
      missingRowsPenalty: 100,
      superfluousRowsPenalty: 100,
      wrongOrderPenalty: 100,
      expectedColumnNames: null,
      alternativeSolutions: []
    };
  }

  protected override onOriginalDataChanged(data: unknown | undefined): void {
    const list = this.form?.controls.alternativeSolutions;
    if (!list)
      return;
    list.clear();
    const alternatives = (data as { alternativeSolutions?: { solution: string; pointsPercent: number }[] })?.alternativeSolutions ?? [];
    for (const alt of alternatives) {
      const group = createAlternativeGroup();
      group.patchValue(alt);
      list.push(group);
    }
    this.applyConditionalValidators();
  }

  get alternativeSolutions(): FormArray<FormGroup<AlternativeSolutionForm>> {
    return this.form.controls.alternativeSolutions;
  }

  get isMultiSolution(): boolean {
    return this.form.controls.evaluationMode.value === 'MULTI_SOLUTION';
  }

  addAlternative(): void {
    const group = createAlternativeGroup();
    if (this.alternativeSolutions.length === 0)
      group.patchValue({ pointsPercent: 100 });
    this.alternativeSolutions.push(group);
    this.alternativeSolutions.markAsDirty();
  }

  removeAlternative(index: number): void {
    this.alternativeSolutions.removeAt(index);
    this.alternativeSolutions.markAsDirty();
  }

  moveAlternative(index: number, direction: -1 | 1): void {
    const target = index + direction;
    if (target < 0 || target >= this.alternativeSolutions.length)
      return;
    const control = this.alternativeSolutions.at(index);
    this.alternativeSolutions.removeAt(index);
    this.alternativeSolutions.insert(target, control);
    this.alternativeSolutions.markAsDirty();
  }

  alternativeAt(index: number): FormGroup<AlternativeSolutionForm> {
    return this.alternativeSolutions.at(index);
  }

  get alternativesError(): string | null {
    const errors = this.alternativeSolutions.errors;
    if (!errors)
      return null;
    if (errors['alternativesEmpty'])
      return this.translationService.translate('taskTypes.cypher.errors.alternativesEmpty');
    if (errors['alternativesNoHundred'])
      return this.translationService.translate('taskTypes.cypher.errors.alternativesNoHundred');
    return null;
  }

  private applyConditionalValidators(): void {
    const mode = this.form.controls.evaluationMode.value;
    const solution = this.form.controls.solution;
    if (mode === 'PENALTY') {
      solution.setValidators([Validators.required, Validators.minLength(1)]);
    } else {
      solution.clearValidators();
    }
    solution.updateValueAndValidity({ emitEvent: false });
    this.form.controls.alternativeSolutions.updateValueAndValidity({ emitEvent: false });
  }
}

function createAlternativeGroup(): FormGroup<AlternativeSolutionForm> {
  return new FormGroup<AlternativeSolutionForm>({
    solution: new FormControl<string | null>(null, [Validators.required, Validators.minLength(1)]),
    pointsPercent: new FormControl<number | null>(null, [Validators.required, Validators.min(0), Validators.max(100)])
  });
}

function multiSolutionListValidator(getMode: () => CypherEvaluationMode | null): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (getMode() !== 'MULTI_SOLUTION')
      return null;
    const array = control as FormArray;
    if (array.length === 0)
      return { alternativesEmpty: true };
    const hasHundred = array.controls.some(group => group.get('pointsPercent')?.value === 100);
    if (!hasHundred)
      return { alternativesNoHundred: true };
    return null;
  };
}
