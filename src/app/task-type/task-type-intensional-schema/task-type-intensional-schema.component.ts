import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule } from 'primeng/paginator';

import { TaskTypeFormComponent } from '../task-type-form.component';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { InputTextModule } from 'primeng/inputtext';
import { editor } from 'monaco-editor';
import { NgForOf, NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';

/**
 * Task Type Form: Intensional Schema
 */
@Component({
  selector: 'dke-task-type-intensional-schema',
  standalone: true,
  imports: [
    InputNumberModule,
    PaginatorModule,
    ReactiveFormsModule,
    TranslocoDirective,
    EditorComponent,
    InputTextModule,
    NgForOf,
    ButtonModule,
    NgIf,
    TranslocoPipe,
    DividerModule
  ],
  templateUrl: './task-type-intensional-schema.component.html',
  styleUrl: './task-type-intensional-schema.component.scss'
})
export class TaskTypeIntensionalSchemaComponent extends TaskTypeFormComponent<TaskTypeForm> {

  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'sql'
  };

  solutionType: Array<{ id: number; name: string }> = [
    { id: 1, name: 'Type Specification' },
    { id: 2, name: 'Type Body' }
  ];

  /**
   * Creates a new instance of class TaskTypeIntensionalSchemaComponent.
   */
  constructor(private readonly fb: FormBuilder) {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('dmlStatements', new FormControl<string | null>(null));
    this.form.addControl('diagnoseDmlStatements', new FormControl<string | null>(null));
    this.form.addControl('submitDmlStatements', new FormControl<string | null>(null));
    this.form.addControl('superfluousPenalty', new FormControl<number | null>(0));
    this.form.addControl('solutionAspects', this.fb.array<FormGroup>([]));
  }

  get solutionAspects(): FormArray<FormGroup> {
    return this.form.get('solutionAspects') as FormArray<FormGroup>;
  }

  public getEvaluations(aspectIndex: number): FormArray<FormGroup> {
    return this.solutionAspects.at(aspectIndex).get('taskSolutionAspects') as FormArray<FormGroup>;
  }

  private createAspect(): FormGroup {
    return this.fb.group({
      solutionName: new FormControl<string | null>(null),
      solutionType: new FormControl<string | null>(this.solutionType[0]?.name ?? null),
      solutionMaxPoints: new FormControl<number | null>(null),
      solution: new FormControl<string | null>(null),
      showEval: new FormControl<boolean>(false),
      taskSolutionAspects: this.fb.array<FormGroup>([]),
      typeBodyEntries: this.fb.array<FormGroup>([])
    });
  }

  private createTypeBodyEntry(): FormGroup {
    return this.fb.group({
      methodName: new FormControl<string | null>(null),
      targetTable: new FormControl<string | null>(null),
      declareStatement: new FormControl<string | null>(null)
    });
  }

  public getTypeBodyEntries(aspectIndex: number): FormArray<FormGroup> {
    return this.solutionAspects.at(aspectIndex).get('typeBodyEntries') as FormArray<FormGroup>;
  }

  public addTypeBodyEntry(aspectIndex: number): void {
    this.getTypeBodyEntries(aspectIndex).push(this.createTypeBodyEntry());
  }

  public removeTypeBodyEntry(aspectIndex: number, entryIndex: number): void {
    this.getTypeBodyEntries(aspectIndex).removeAt(entryIndex);
  }

  private createEvaluation(): FormGroup {
    return this.fb.group({
      solutionAspectName: new FormControl<string | null>(null),
      solutionAspectPoints: new FormControl<number | null>(null),
    });
  }

  protected override onOriginalDataChanged(originalData: unknown): void {
    const data = originalData as any;
    if (data?.superfluousPenalty != null) {
      this.form.get('superfluousPenalty')?.setValue(data.superfluousPenalty);
    }
    this.loadSolutionAspects(originalData);
  }

  private loadSolutionAspects(additionalData: any): void {
    if (!additionalData?.solutionAspects) return;

    this.solutionAspects.clear();

    for (const sol of additionalData.solutionAspects) {
      const grp = this.createAspect();

      grp.patchValue({
        solutionName: sol.solutionName,
        solutionMaxPoints: sol.solutionMaxPoints,
        solution: sol.solution,
      });

      let mappedName: string | null = null;
      if (sol.solutionType != null && Array.isArray(this.solutionType) && this.solutionType.length > 0) {
        if (typeof sol.solutionType === 'object') {
          mappedName = sol.solutionType.name ?? (this.solutionType.find(s => s.id === sol.solutionType.id)?.name ?? null);
        } else if (typeof sol.solutionType === 'number') {
          mappedName = this.solutionType.find(s => s.id === sol.solutionType)?.name ?? null;
        } else if (typeof sol.solutionType === 'string') {
          mappedName = this.solutionType.find(s => s.name === sol.solutionType)?.name ?? sol.solutionType;
        }
      }

      grp.get('solutionType')?.setValue(mappedName);

      this.solutionAspects.push(grp);
      const index = this.solutionAspects.length - 1;

      if (Array.isArray(sol.typeBodyEntries) && sol.typeBodyEntries.length > 0) {
        const entries = this.getTypeBodyEntries(index);
        for (const entry of sol.typeBodyEntries) {
          const eg = this.createTypeBodyEntry();
          eg.patchValue({
            methodName: entry.methodName ?? null,
            targetTable: entry.targetTable ?? null,
            declareStatement: entry.declareStatement ?? null,
          });
          entries.push(eg);
        }
      }

      if (Array.isArray(sol.taskSolutionAspects) && sol.taskSolutionAspects.length > 0) {
        grp.get('showEval')?.setValue(true);
        const evals = this.getEvaluations(index);

        for (const ev of sol.taskSolutionAspects) {
          const egroup = this.createEvaluation();
          egroup.patchValue({
            solutionAspectName: ev.solutionAspectName,
            solutionAspectPoints: ev.solutionAspectPoints,
          });
          evals.push(egroup);
        }
      }
    }
  }

  addSolution(): void {
    this.solutionAspects.push(this.createAspect());
  }

  removeSolution(index: number): void {
    this.solutionAspects.removeAt(index);
  }

  toggleSolutionEval(i: number): void {
    const grp = this.solutionAspects.at(i);
    const evals = grp.get('taskSolutionAspects') as FormArray;

    const current = grp.get('showEval')?.value;
    grp.get('showEval')?.setValue(!current);

    if (!current && evals.length === 0) {
      evals.push(this.createEvaluation());
    }
  }

  public addEvaluation(aspectIndex: number): void {
    this.getEvaluations(aspectIndex).push(this.createEvaluation());
    this.recalculateMaxPoints(aspectIndex);
  }

  public removeEvaluation(aspectIndex: number, evalIndex: number): void {
    this.getEvaluations(aspectIndex).removeAt(evalIndex);
    this.recalculateMaxPoints(aspectIndex);
  }

  public recalculateMaxPoints(aspectIndex: number): void {
    const evals = this.getEvaluations(aspectIndex);
    const sum = evals.controls.reduce((acc, ctrl) => acc + (ctrl.get('solutionAspectPoints')?.value ?? 0), 0);
    this.solutionAspects.at(aspectIndex).get('solutionMaxPoints')?.setValue(sum);
  }

  public isTypeBody(aspectIndex: number): boolean {
    return this.solutionAspects.at(aspectIndex).get('solutionType')?.value === 'Type Body';
  }

  public asFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }
}

interface TaskTypeForm {
  dmlStatements: FormControl<string | null>;
  diagnoseDmlStatements: FormControl<string | null>;
  submitDmlStatements: FormControl<string | null>;
  superfluousPenalty: FormControl<number | null>;
  solutionAspects: FormArray<FormGroup>;
}
