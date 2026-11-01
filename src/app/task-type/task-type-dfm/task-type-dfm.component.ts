import { Component, Input, OnDestroy } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import {
  AbstractControl,
  FormArray,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators
} from '@angular/forms';
import { TranslocoDirective, TranslocoPipe } from '@ngneat/transloco';
import { Subscription } from 'rxjs';
import { MessageService } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { TooltipModule } from 'primeng/tooltip';
import { editor } from 'monaco-editor';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeFormComponent } from '../task-type-form.component';
import { TaskForm } from '../task.form';
import { isValidDfmSyntax } from './dfm-syntax.validator';
import { DfmGraph, DfmParseError } from './dfm-graph.model';
import { DfmGraphComponent } from './dfm-graph.component';
import { DfmService } from './dfm.service';

/**
 * The state of the graph preview of a DFM editor.
 */
export interface DfmPreview {
  loading: boolean;
  /** The model the preview was created for. */
  source: string | null;
  graph: DfmGraph | null;
  error: { message: string; line: number | null; column: number | null } | null;
}

interface TaskTypeForm {
  allowGrading: FormControl<boolean | null>;
  checkNames: FormControl<boolean | null>;
  solution: FormControl<string | null>;
  evaluationCriteria: FormArray<EvaluationCriterionForm>;
}

interface EvaluationCriterionFormValue {
  name: string | null;
  points: number | null;
  subtree: string | null;
  partialSolution: boolean | null;
  allowIncorrectFactClass: boolean | null;
}

type EvaluationCriterionForm = FormGroup<{
  name: FormControl<string | null>;
  points: FormControl<number | null>;
  subtree: FormControl<string | null>;
  partialSolution: FormControl<boolean | null>;
  allowIncorrectFactClass: FormControl<boolean | null>;
}>;

@Component({
  selector: 'dke-task-type-dfm',
  standalone: true,
  imports: [
    ButtonModule,
    CheckboxModule,
    DfmGraphComponent,
    FormsModule,
    InputNumberModule,
    InputTextModule,
    MonacoEditorModule,
    NgTemplateOutlet,
    ReactiveFormsModule,
    TranslocoDirective,
    TranslocoPipe,
    TooltipModule
  ],
  templateUrl: './task-type-dfm.component.html',
  styleUrl: './task-type-dfm.component.scss'
})
export class TaskTypeDfmComponent extends TaskTypeFormComponent<TaskTypeForm> implements OnDestroy {

  readonly editorOptions: editor.IStandaloneEditorConstructionOptions = {
    language: 'plaintext',
    minimap: {enabled: false},
    scrollBeyondLastLine: false,
    wordWrap: 'on'
  };

  readonly evaluationCriteria = new FormArray<EvaluationCriterionForm>([], [this.pointsTotalValidator()]);
  readonly solutionPreview: DfmPreview = createPreview();
  private readonly submodelPreviews = new WeakMap<AbstractControl, DfmPreview>();
  private parentMaxPointsSubscription?: Subscription;
  private examTaskSubscription?: Subscription;
  private gradingBeforeExamTask?: boolean;

  constructor(
    private readonly messageService: MessageService,
    private readonly dfmService: DfmService
  ) {
    super();
  }

  @Input({required: false})
  override set parentForm(value: FormGroup<TaskForm> | undefined) {
    super.parentForm = value;
    this.parentMaxPointsSubscription?.unsubscribe();
    this.parentMaxPointsSubscription = value?.controls.maxPoints.valueChanges.subscribe(() =>
      this.evaluationCriteria.updateValueAndValidity()
    );
    this.evaluationCriteria.updateValueAndValidity({emitEvent: false});

    this.examTaskSubscription?.unsubscribe();
    this.examTaskSubscription = value?.controls.examTask.valueChanges.subscribe(() => this.syncGradingWithExamTask());
    this.syncGradingWithExamTask();
  }

  override get parentForm(): FormGroup<TaskForm> | undefined {
    return super.parentForm;
  }

  override set formData(data: unknown) {
    this.evaluationCriteria.clear({emitEvent: false});
    for (const criterion of this.readCriteria(data))
      this.evaluationCriteria.push(this.createCriterionForm(criterion), {emitEvent: false});
    super.formData = data;
    this.syncGradingWithExamTask();
  }

  /**
   * Whether the task is an exam task. Exam tasks are always graded.
   */
  get isExamTask(): boolean {
    return this.parentForm?.controls.examTask.value === true;
  }

  /**
   * Forces grading for exam tasks and restores the previous choice afterwards.
   * The control stays enabled so that its value is still part of the submitted form value.
   */
  private syncGradingWithExamTask(): void {
    const allowGrading = this.form?.controls.allowGrading;
    if (!allowGrading)
      return;

    if (this.isExamTask) {
      if (allowGrading.value !== true) {
        this.gradingBeforeExamTask ??= allowGrading.value ?? false;
        allowGrading.setValue(true);
      }
    } else if (this.gradingBeforeExamTask !== undefined) {
      allowGrading.setValue(this.gradingBeforeExamTask);
      this.gradingBeforeExamTask = undefined;
    }
  }

  protected override initForm(): void {
    this.form.addControl('allowGrading', new FormControl<boolean>(false));
    this.form.addControl('checkNames', new FormControl<boolean>(false));
    this.form.addControl('solution', new FormControl<string | null>(null, [
      this.nonBlankValidator,
      Validators.maxLength(5000),
      this.dfmSyntaxValidator
    ]));
    this.form.addControl('evaluationCriteria', this.evaluationCriteria);
  }

  addEvaluationCriterion(): void {
    this.evaluationCriteria.push(this.createCriterionForm());
    this.evaluationCriteria.markAsDirty();
  }

  removeEvaluationCriterion(index: number): void {
    this.evaluationCriteria.removeAt(index);
    this.evaluationCriteria.markAsDirty();
  }

  clearSolution(): void {
    const solution = this.form.controls.solution;
    solution.setValue('');
    solution.markAsDirty();
    Object.assign(this.solutionPreview, createPreview());
  }

  async copySolution(): Promise<void> {
    await this.copyToClipboard(this.form.controls.solution.value);
  }

  clearSubmodel(criterion: EvaluationCriterionForm): void {
    const subtree = criterion.controls.subtree;
    subtree.setValue('');
    subtree.markAsDirty();
    Object.assign(this.submodelPreview(subtree), createPreview());
  }

  /**
   * Returns the preview state of the submodel editor.
   *
   * @param subtree The control of the submodel.
   */
  submodelPreview(subtree: AbstractControl): DfmPreview {
    let preview = this.submodelPreviews.get(subtree);
    if (!preview) {
      preview = createPreview();
      this.submodelPreviews.set(subtree, preview);
    }
    return preview;
  }

  async previewSolution(): Promise<void> {
    await this.loadPreview(this.form.controls.solution.value, this.solutionPreview);
  }

  async previewSubmodel(subtree: FormControl<string | null>): Promise<void> {
    await this.loadPreview(subtree.value, this.submodelPreview(subtree));
  }

  dismissPreview(preview: DfmPreview): void {
    Object.assign(preview, createPreview());
  }

  async downloadPreview(graphComponent: DfmGraphComponent): Promise<void> {
    try {
      await graphComponent.downloadPng();
    } catch (error) {
      console.error('[TaskTypeDfmComponent] Could not download DFM preview as PNG', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translationService.translate('taskTypes.dfm.errors.downloadPng'),
        key: 'global'
      });
    }
  }

  private async loadPreview(source: string | null, preview: DfmPreview): Promise<void> {
    if (!source?.trim() || preview.loading)
      return;

    preview.loading = true;
    preview.source = source;
    preview.error = null;
    try {
      preview.graph = await this.dfmService.parse(source);
    } catch (error) {
      preview.graph = null;
      preview.error = error instanceof DfmParseError
        ? {message: error.message, line: error.line, column: error.column}
        : {message: this.translationService.translate('taskTypes.dfm.errors.preview'), line: null, column: null};
    } finally {
      preview.loading = false;
    }
  }

  async copySubmodel(subtree: FormControl<string | null>): Promise<void> {
    await this.copyToClipboard(subtree.value);
  }

  private async copyToClipboard(value: string | null): Promise<void> {
    try {
      await navigator.clipboard.writeText(value ?? '');
    } catch (error) {
      console.error('[TaskTypeDfmComponent] Could not copy text to clipboard', error);
      this.messageService.add({
        severity: 'error',
        detail: this.translationService.translate('taskTypes.dfm.errors.copyToClipboard'),
        key: 'global'
      });
    }
  }

  ngOnDestroy(): void {
    this.parentMaxPointsSubscription?.unsubscribe();
    this.examTaskSubscription?.unsubscribe();
  }

  private readCriteria(data: unknown): EvaluationCriterionFormValue[] {
    if (typeof data !== 'object' || data === null || !('evaluationCriteria' in data) ||
      !Array.isArray(data.evaluationCriteria))
      return [];

    return data.evaluationCriteria.map(value => {
      const criterion = typeof value === 'object' && value !== null
        ? value as Record<string, unknown>
        : {};
      return {
        name: typeof criterion['name'] === 'string' ? criterion['name'] : null,
        points: typeof criterion['points'] === 'number' ? criterion['points'] : null,
        subtree: typeof criterion['subtree'] === 'string' ? criterion['subtree'] : null,
        partialSolution: typeof criterion['partialSolution'] === 'boolean' ? criterion['partialSolution'] : false,
        allowIncorrectFactClass: typeof criterion['allowIncorrectFactClass'] === 'boolean'
          ? criterion['allowIncorrectFactClass']
          : false
      };
    });
  }

  private createCriterionForm(value?: EvaluationCriterionFormValue): EvaluationCriterionForm {
    return new FormGroup({
      name: new FormControl<string | null>(value?.name ?? '', [this.nonBlankValidator, Validators.maxLength(255)]),
      points: new FormControl<number | null>(value?.points ?? null, [Validators.required, Validators.min(0)]),
      subtree: new FormControl<string | null>(value?.subtree ?? '', [
        this.nonBlankValidator,
        Validators.maxLength(5000),
        this.dfmSyntaxValidator
      ]),
      partialSolution: new FormControl<boolean | null>(value?.partialSolution ?? false),
      allowIncorrectFactClass: new FormControl<boolean | null>(value?.allowIncorrectFactClass ?? false)
    });
  }

  private readonly nonBlankValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null =>
    typeof control.value === 'string' && control.value.trim().length > 0 ? null : {required: true};

  private readonly dfmSyntaxValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const value = control.value;
    if (typeof value !== 'string' || value.trim().length === 0)
      return null;
    return isValidDfmSyntax(value) ? null : {dfmSyntax: true};
  };

  private pointsTotalValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const criteria = control as FormArray<EvaluationCriterionForm>;
      if (criteria.length === 0)
        return null;

      const pointControls = criteria.controls.map(criterion => criterion.controls.points);
      if (pointControls.some(points => points.invalid || points.value === null || !Number.isFinite(points.value)))
        return null;

      const maxPoints = this.parentForm?.controls.maxPoints.value;
      if (maxPoints === null || maxPoints === undefined)
        return null;

      const total = pointControls.reduce((sum, points) => sum + (points.value ?? 0), 0);
      return Math.round(total * 100) === Math.round(maxPoints * 100)
        ? null
        : {pointsTotalMismatch: true};
    };
  }
}

function createPreview(): DfmPreview {
  return {loading: false, source: null, graph: null, error: null};
}
