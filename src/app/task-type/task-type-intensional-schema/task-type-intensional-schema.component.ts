import { Component, OnChanges, OnDestroy, OnInit, SimpleChanges } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslocoDirective } from '@ngneat/transloco';
import { distinctUntilChanged, Subscription } from 'rxjs';
import { InputNumberModule } from 'primeng/inputnumber';
import { PaginatorModule } from 'primeng/paginator';

import { TaskTypeFormComponent } from '../task-type-form.component';
import { TaskGroupService, TaskService } from '../../api';
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
    NgIf
  ],
  templateUrl: './task-type-intensional-schema.component.html',
  styleUrl: './task-type-intensional-schema.component.scss'
})
export class TaskTypeIntensionalSchemaComponent extends TaskTypeFormComponent<TaskTypeForm> implements OnChanges, OnDestroy, OnInit{

  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'sql'
  };

  private sub?: Subscription;

  /**
   * Creates a new instance of class TaskTypeIntensionalSchemaComponent.
   */
  constructor(private readonly taskGroupService: TaskGroupService, private readonly taskService: TaskService, private readonly fb: FormBuilder) {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('solutionName', new FormControl<string | null>(null));
    this.form.addControl('solutionMaxPoints', new FormControl<number | null>(null));
    this.form.addControl('solution', new FormControl<string | null>(null));
    this.form.addControl('solutionAspectName', new FormControl<string | null>(null));
    this.form.addControl('solutionAspectPoints', new FormControl<number | null>(null));
    this.form.addControl('solutionAspects', this.fb.array<FormGroup>([]));
  }

  // getter for template access
  get solutionAspects(): FormArray<FormGroup> {
    return this.form.get('solutionAspects') as FormArray<FormGroup>;
  }

  // access evaluations FormArray for an aspect by index
  public getEvaluations(aspectIndex: number): FormArray<FormGroup> {
    return this.solutionAspects.at(aspectIndex).get('taskSolutionAspects') as FormArray<FormGroup>;
  }

  ngOnInit(): void {
    //this.sub?.unsubscribe();
    // load any pre-existing solution aspects from the parent form's additionalData
    // try {
    //   this.loadSolutionAspects(this.parentForm?.controls.additionalData);
    // } catch (e) {
      // ignore
   // }
    const taskGroupId = this.parentForm?.controls.taskGroupId.value;
    if (taskGroupId != null) {
      const tg = this.taskGroupService.get(taskGroupId);
      const task = this.taskService.get(69);
      console.log("Task Group loaded: ", tg);
      console.log("Task loaded: ", task);
      this.loadSolutionAspects(task.then(t => t.additionalData));
    }

  }

  private createAspect(): FormGroup {
    return this.fb.group({
      solutionName: new FormControl<string | null>(null),
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
    console.log("Loading solution aspects from additional data: ", additionalData?.solutionAspects);
    if (!additionalData?.solutionAspects) return;

    this.solutionAspects.clear();

    for (const sol of additionalData.solutionAspects) {
      const grp = this.createAspect();

      grp.patchValue({
        solutionName: sol.solutionName,
        solutionMaxPoints: sol.solutionMaxPoints,
        solution: sol.solution,
      });

      this.solutionAspects.push(grp);
      const index = this.solutionAspects.length - 1;

      // Load nested evaluations
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

  // called from template to add a new aspect
  addAspect(): void {
    this.solutionAspects.push(this.createAspect());
  }

  // called from template to remove an aspect by index
  removeAspect(index: number): void {
    this.solutionAspects.removeAt(index);
  }

  toggleSolutionEval(i: number): void {
    const grp = this.solutionAspects.at(i);
    const evals = grp.get("taskSolutionAspects") as FormArray;

    const current = grp.get("showEval")?.value;
    grp.get("showEval")?.setValue(!current);

    // When enabling, ensure at least one evaluation row exists
    if (!current && evals.length === 0) {
      evals.push(this.createEvaluation());
    }
  }

  // add/remove evaluation entries inside an aspect
  public addEvaluation(aspectIndex: number): void {
    this.getEvaluations(aspectIndex).push(this.createEvaluation());
  }

  public removeEvaluation(aspectIndex: number, evalIndex: number): void {
    this.getEvaluations(aspectIndex).removeAt(evalIndex);
  }

  // toggleSolutionEval(i: number): void {
  //   const grp = this.solutionAspects.at(i);
  //   const evals = grp.get('taskSolutionAspects') as FormArray;
  //
  //   const current = grp.get('showEval')?.value;
  //   grp.get('showEval')?.setValue(!current);
  //
  //   // When enabling, ensure at least one evaluation row exists
  //   if (!current && evals.length === 0) {
  //     evals.push(this.createEvaluation());
  //   }
  // }

  // public toggleSolutionEval(index: number): void {
  //   const aspect = this.solutionAspects.at(index) as FormGroup;
  //   const current = !!aspect.get('showEval')?.value;
  //   aspect.get('showEval')?.setValue(!current);
  //
  //   const evals = aspect.get('taskSolutionAspects') as FormArray;
  //   if (!current) {
  //     // enabling evaluations: ensure at least one evaluation exists and make it required
  //     if (evals.length === 0) {
  //       evals.push(this.createEvaluation());
  //     }
  //     const first = evals.at(0) as FormGroup;
  //     first.get('solutionAspectName')?.setValidators([Validators.required]);
  //     first.get('solutionAspectPoints')?.setValidators([Validators.min(0)]);
  //     first.get('solutionAspectName')?.updateValueAndValidity();
  //     first.get('solutionAspectPoints')?.updateValueAndValidity();
  //   } else {
  //     // disabling: clear validators and remove all evaluations
  //     evals.controls.forEach(c => {
  //       const fg = c as FormGroup;
  //       fg.get('solutionAspectName')?.clearValidators();
  //       fg.get('solutionAspectPoints')?.clearValidators();
  //       fg.get('solutionAspectName')?.setValue('');
  //       fg.get('solutionAspectPoints')?.setValue(0);
  //       fg.get('solutionAspectName')?.updateValueAndValidity();
  //       fg.get('solutionAspectPoints')?.updateValueAndValidity();
  //     });
  //     evals.clear();
  //   }
  // }

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

    // load any pre-existing solution aspects from the parent form's additionalData
    try {
      this.loadSolutionAspects(changes['parentForm'].currentValue);
    } catch (e) {
      // ignore
    }
  }

  // reads additionalData.solutionAspects from the parent form and populates the local FormArray
  // private loadSolutionAspects(additionalData: any): void {
  //   if (!additionalData?.solutionAspects) return;
  //
  //   this.solutionAspects.clear();
  //
  //   for (const sol of additionalData.solutionAspects) {
  //     const grp = this.createAspect();
  //
  //     grp.patchValue({
  //       solutionName: sol.solutionName,
  //       solutionMaxPoints: sol.solutionMaxPoints,
  //       solution: sol.solution,
  //     });
  //
  //     this.solutionAspects.push(grp);
  //     const index = this.solutionAspects.length - 1;
  //
  //     // Load nested evaluations
  //     if (Array.isArray(sol.taskSolutionAspects) && sol.taskSolutionAspects.length > 0) {
  //       grp.get("showEval")?.setValue(true);
  //       const evals = this.getEvaluations(index);
  //
  //       for (const ev of sol.taskSolutionAspects) {
  //         const egroup = this.createEvaluation();
  //         egroup.patchValue({
  //           solutionAspectName: ev.solutionAspectName,
  //           solutionAspectPoints: ev.solutionAspectPoints,
  //         });
  //         evals.push(egroup);
  //       }
  //     }
  //   }
  // }


  /**
   * Unsubscribes from all subscriptions.
   */
  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }

  private async updateValidator(taskGroupId: number | null): Promise<void> {
    if (!taskGroupId) {
      console.info('updateValidator: ' + taskGroupId);
      return;
    }

    this.form.controls.solution.clearValidators();
    // this.form.controls.solution.addValidators(Validators.required);
    try {
      const tg = await this.taskGroupService.get(taskGroupId);
      if (!tg.additionalData || tg.dto.taskGroupType !== 'intensional-schema')
        return;

      const min = tg.additionalData['minNumber'] as number;
      const max = tg.additionalData['maxNumber'] as number;
      this.form.controls.solution.addValidators(Validators.min(min));
      this.form.controls.solution.addValidators(Validators.max(max));
      this.form.controls.solution.updateValueAndValidity();
    } catch (err) {
      // ignore
    }
  }

  // helper used from template to ensure AbstractControl is treated as FormControl
  public asFormControl(control: AbstractControl | null): FormControl {
    return control as FormControl;
  }
}

interface TaskTypeForm {
  solutionName: FormControl<string | null>;
  solutionMaxPoints: FormControl<number | null>;
  solution: FormControl<string | null>;
  solutionAspectName: FormControl<string | null>;
  solutionAspectPoints: FormControl<number | null>;
  solutionAspects: FormArray<FormGroup>;
}
