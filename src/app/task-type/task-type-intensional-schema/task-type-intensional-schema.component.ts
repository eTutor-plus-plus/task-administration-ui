import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import {TranslocoDirective, TranslocoPipe} from '@ngneat/transloco';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule } from 'primeng/paginator';

import { TaskTypeFormComponent } from '../task-type-form.component';
import { TaskDetailsDto, TaskGroupService, TaskService } from '../../api';
import { EditorComponent } from 'ngx-monaco-editor-v2';
import { InputTextModule } from 'primeng/inputtext';
import { editor } from 'monaco-editor';
import { NgForOf, NgIf } from '@angular/common';
import { ButtonModule } from 'primeng/button';

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
        TranslocoPipe
    ],
  templateUrl: './task-type-intensional-schema.component.html',
  styleUrl: './task-type-intensional-schema.component.scss'
})
export class TaskTypeIntensionalSchemaComponent extends TaskTypeFormComponent<TaskTypeForm> implements OnChanges, OnDestroy, OnInit {

  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'sql'
  };

  private sub?: Subscription;
  solutionType: Array<{ id: number; name: string }> = [];

  /**
   * Creates a new instance of class TaskTypeIntensionalSchemaComponent.
   */
  constructor(private readonly taskGroupService: TaskGroupService, private readonly taskService: TaskService, private readonly fb: FormBuilder) {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('solutionAspects', this.fb.array<FormGroup>([]));
  }

  get solutionAspects(): FormArray<FormGroup> {
    return this.form.get('solutionAspects') as FormArray<FormGroup>;
  }

  public getEvaluations(aspectIndex: number): FormArray<FormGroup> {
    return this.solutionAspects.at(aspectIndex).get('taskSolutionAspects') as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    const taskGroupId = this.parentForm?.controls.taskGroupId.value;
    this.solutionType = [ { id: 1, name: 'Type Object' }, { id: 2, name: 'Type Body' } ];

    if (taskGroupId != null) {
      const taskId = this.task?.id as number
      const task = this.taskService.get(taskId).then(
        (td: TaskDetailsDto) => {
          this.loadSolutionAspects(td.additionalData)
        }
      );
    }
  }

  private createAspect(): FormGroup {
    return this.fb.group({
      solutionName: new FormControl<string | null>(null),
      solutionType: new FormControl<string | null>(this.solutionType[0]?.name ?? null),
      solutionMaxPoints: new FormControl<number | null>(null),
      solution: new FormControl<string | null>(null),
      showEval: new FormControl<boolean>(false),
      taskSolutionAspects: this.fb.array<FormGroup>([])
    });
  }

  private createEvaluation(): FormGroup {
    return this.fb.group({
      solutionAspectName: new FormControl<string | null>(null),
      solutionAspectPoints: new FormControl<number | null>(null),
    });
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
  }

  public removeEvaluation(aspectIndex: number, evalIndex: number): void {
    this.getEvaluations(aspectIndex).removeAt(evalIndex);
  }

  /**
   * Listens to input changes.
   *
   * @param changes The changes.
   */
  ngOnChanges(changes: SimpleChanges): void {
    if (!('parentForm' in changes))
      return;

    this.sub?.unsubscribe();
    this.sub = changes['parentForm'].currentValue.controls.taskGroupId.valueChanges
      .pipe(distinctUntilChanged()).subscribe((val: number | null) => this.updateValidator(val));

    try {
      this.loadSolutionAspects(changes['parentForm'].currentValue);
    } catch (e) {
      // ignore
    }
  }

  /**
   * Unsubscribes from all subscriptions.
   */
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private async updateValidator(taskGroupId: number | null): Promise<void> {
    if (!taskGroupId) {
      return;
    }

    this.form.controls.solution.clearValidators();
    try {
      const tg = await this.taskGroupService.get(taskGroupId);
      if (!tg.additionalData || tg.dto.taskGroupType !== 'intensional-schema')
        return;

      this.form.controls.solution.updateValueAndValidity();
    } catch (err) {
      // ignore
    }
  }

  public asFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }
}

interface TaskTypeForm {
  solutionName: FormControl<string | null>;
  solution: FormControl<string | null>;
  solutionAspectName: FormControl<string | null>;
  solutionAspectPoints: FormControl<number | null>;
  solutionAspects: FormArray<FormGroup>;
}
