import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTransloco } from '@ngneat/transloco';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormArray, FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { MessageService, TreeNode } from 'primeng/api';

import { TaskTypeDfmComponent } from './task-type-dfm.component';
import { DfmGraphComponent } from './dfm-graph.component';
import { DfmService } from './dfm.service';
import { DfmGraph, DfmParseError } from './dfm-graph.model';
import { StatusEnum } from '../../api';
import { API_URL } from '../../app.config';
import { TranslationLoaderService } from '../../translation-loader.service';
import { TaskForm } from '../task.form';

describe('TaskTypeDfmComponent', () => {
  let component: TaskTypeDfmComponent;
  let fixture: ComponentFixture<TaskTypeDfmComponent>;
  let clipboardDescriptor: PropertyDescriptor | undefined;

  beforeEach(async () => {
    clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    await TestBed.configureTestingModule({
      imports: [TaskTypeDfmComponent],
      providers: [
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: API_URL, useValue: 'http://localhost'},
        provideTransloco({
          config: {
            defaultLang: 'en',
            fallbackLang: 'en',
            availableLangs: ['en', 'de'],
            prodMode: false,
            missingHandler: {
              useFallbackTranslation: true,
              logMissingKey: false
            },
            flatten: {
              aot: false
            }
          },
          loader: TranslationLoaderService
        })
      ]
    })
    .overrideComponent(TaskTypeDfmComponent, {set: {template: ''}})
    .compileComponents();

    fixture = TestBed.createComponent(TaskTypeDfmComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    component.parentForm = createParentForm(10);
    component.formData = null;
    fixture.detectChanges();
  });

  afterEach(() => {
    if (clipboardDescriptor)
      Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
    else
      Reflect.deleteProperty(navigator, 'clipboard');
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.form.controls.allowGrading).toBeDefined();
    expect(component.form.controls.checkNames).toBeDefined();
  });

  it('should automatically adjust the editors when their size changes', () => {
    expect(component.editorOptions.automaticLayout).toBe(true);
  });

  it('should clear the solution and mark it as changed', () => {
    component.form.controls.solution.setValue('fact Sales { amount };');
    component.form.controls.solution.markAsPristine();

    component.clearSolution();

    expect(component.form.controls.solution.value).toBe('');
    expect(component.form.controls.solution.dirty).toBe(true);
  });

  it('should clear a submodel and mark it as changed', () => {
    component.addEvaluationCriterion();
    const criterion = component.evaluationCriteria.at(0);
    criterion.controls.subtree.setValue('fact Sales { amount };');
    criterion.controls.subtree.markAsPristine();

    component.clearSubmodel(criterion);

    expect(criterion.controls.subtree.value).toBe('');
    expect(criterion.controls.subtree.dirty).toBe(true);
  });

  it('should copy the solution to the clipboard', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText}
    });
    component.form.controls.solution.setValue('fact Sales { amount };');

    await component.copySolution();

    expect(writeText).toHaveBeenCalledWith('fact Sales { amount };');
  });

  it('should copy a submodel to the clipboard', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText}
    });
    component.addEvaluationCriterion();
    const subtree = component.evaluationCriteria.at(0).controls.subtree;
    subtree.setValue('fact Sales { amount };');

    await component.copySubmodel(subtree);

    expect(writeText).toHaveBeenCalledWith('fact Sales { amount };');
  });

  it('should report clipboard errors', async () => {
    const error = new Error('Clipboard unavailable');
    const writeText = jest.fn().mockRejectedValue(error);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText}
    });
    const messageService = TestBed.inject(MessageService);
    const addMessage = jest.spyOn(messageService, 'add');
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    await component.copySolution();

    expect(consoleError).toHaveBeenCalledWith('[TaskTypeDfmComponent] Could not copy text to clipboard', error);
    expect(addMessage).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      key: 'global'
    }));
    consoleError.mockRestore();
  });

  it('should load the graph preview of the solution', async () => {
    const graph: DfmGraph = {
      nodes: [{id: 'f', label: 'Sales', type: 'FACT', optional: false, details: []}],
      edges: []
    };
    const parse = jest.spyOn(TestBed.inject(DfmService), 'parse').mockResolvedValue(graph);
    component.form.controls.solution.setValue('fact Sales { amount };');

    await component.previewSolution();

    expect(parse).toHaveBeenCalledWith('fact Sales { amount };');
    expect(component.solutionPreview.graph).toEqual(graph);
    expect(component.solutionPreview.source).toBe('fact Sales { amount };');
    expect(component.solutionPreview.error).toBeNull();
    expect(component.solutionPreview.loading).toBe(false);
  });

  it('should show parse errors of the solution preview', async () => {
    jest.spyOn(TestBed.inject(DfmService), 'parse').mockRejectedValue(new DfmParseError('Unexpected token', 2, 5));
    component.form.controls.solution.setValue('invalid');

    await component.previewSolution();

    expect(component.solutionPreview.graph).toBeNull();
    expect(component.solutionPreview.error).toEqual({message: 'Unexpected token', line: 2, column: 5});
  });

  it('should show a generic error if the preview is not available', async () => {
    jest.spyOn(TestBed.inject(DfmService), 'parse').mockRejectedValue(new Error('offline'));
    component.form.controls.solution.setValue('fact Sales { amount };');

    await component.previewSolution();

    expect(component.solutionPreview.graph).toBeNull();
    expect(component.solutionPreview.error?.message).toBeTruthy();
    expect(component.solutionPreview.error?.line).toBeNull();
  });

  it('should hide a solution preview when dismissed', async () => {
    jest.spyOn(TestBed.inject(DfmService), 'parse').mockResolvedValue({nodes: [], edges: []});
    component.form.controls.solution.setValue('fact Sales { amount };');
    await component.previewSolution();

    component.dismissPreview(component.solutionPreview);

    expect(component.solutionPreview.graph).toBeNull();
    expect(component.solutionPreview.source).toBeNull();
    expect(component.solutionPreview.error).toBeNull();
  });

  it('should hide a submodel preview when dismissed', async () => {
    jest.spyOn(TestBed.inject(DfmService), 'parse').mockResolvedValue({nodes: [], edges: []});
    component.addEvaluationCriterion();
    const subtree = component.evaluationCriteria.at(0).controls.subtree;
    subtree.setValue('fact Sales { amount };');
    await component.previewSubmodel(subtree);

    const preview = component.submodelPreview(subtree);
    component.dismissPreview(preview);

    expect(preview.graph).toBeNull();
    expect(preview.source).toBeNull();
    expect(preview.error).toBeNull();
  });

  it('should report PNG download errors', async () => {
    const error = new Error('Canvas unavailable');
    const graphComponent = new DfmGraphComponent();
    jest.spyOn(graphComponent, 'downloadPng').mockRejectedValue(error);
    const messageService = TestBed.inject(MessageService);
    const addMessage = jest.spyOn(messageService, 'add');
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    await component.downloadPreview(graphComponent);

    expect(consoleError).toHaveBeenCalledWith(
      '[TaskTypeDfmComponent] Could not download DFM preview as PNG',
      error
    );
    expect(addMessage).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      key: 'global'
    }));
    consoleError.mockRestore();
  });

  it('should not request a preview for blank models', async () => {
    const parse = jest.spyOn(TestBed.inject(DfmService), 'parse');
    component.form.controls.solution.setValue('   ');

    await component.previewSolution();

    expect(parse).not.toHaveBeenCalled();
  });

  it('should keep previews of submodels independent and reset them when clearing', async () => {
    const graph: DfmGraph = {nodes: [], edges: []};
    jest.spyOn(TestBed.inject(DfmService), 'parse').mockResolvedValue(graph);
    component.addEvaluationCriterion();
    component.addEvaluationCriterion();
    const [first, second] = component.evaluationCriteria.controls;
    first.controls.subtree.setValue('fact Sales { amount };');

    await component.previewSubmodel(first.controls.subtree);

    expect(component.submodelPreview(first.controls.subtree).graph).toEqual(graph);
    expect(component.submodelPreview(second.controls.subtree).graph).toBeNull();

    component.clearSubmodel(first);
    expect(component.submodelPreview(first.controls.subtree).graph).toBeNull();
  });

  it('should reset the solution preview when clearing the solution', async () => {
    jest.spyOn(TestBed.inject(DfmService), 'parse').mockResolvedValue({nodes: [], edges: []});
    component.form.controls.solution.setValue('fact Sales { amount };');
    await component.previewSolution();

    component.clearSolution();

    expect(component.solutionPreview.graph).toBeNull();
    expect(component.solutionPreview.source).toBeNull();
  });

  it('should force grading for exam tasks and restore the previous choice afterwards', () => {
    const examTask = component.parentForm!.controls.examTask;
    component.form.controls.allowGrading.setValue(false);

    examTask.setValue(true);
    expect(component.isExamTask).toBe(true);
    expect(component.form.controls.allowGrading.value).toBe(true);
    expect(component.form.value.allowGrading).toBe(true);

    examTask.setValue(false);
    expect(component.isExamTask).toBe(false);
    expect(component.form.controls.allowGrading.value).toBe(false);
  });

  it('should enable grading when loading data of an exam task', () => {
    component.parentForm!.controls.examTask.setValue(true);

    component.formData = {allowGrading: false, solution: 'fact Sales { amount };', evaluationCriteria: []};

    expect(component.form.controls.allowGrading.value).toBe(true);
  });

  it('should add and remove evaluation criteria', () => {
    component.addEvaluationCriterion();

    expect(component.evaluationCriteria.length).toBe(1);

    component.removeEvaluationCriterion(0);
    expect(component.evaluationCriteria.length).toBe(0);
  });

  it('should load evaluation criteria when editing a task', () => {
    component.formData = {
      allowGrading: true,
      checkNames: true,
      solution: 'fact Sales { amount };',
      evaluationCriteria: [{
        name: 'Revenue',
        points: 10,
        subtree: 'fact Sales { amount };',
        partialSolution: true,
        allowIncorrectFactClass: false
      }]
    };

    expect(component.evaluationCriteria.length).toBe(1);
    expect(component.evaluationCriteria.at(0).getRawValue()).toEqual({
      name: 'Revenue',
      points: 10,
      subtree: 'fact Sales { amount };',
      partialSolution: true,
      allowIncorrectFactClass: false
    });
    expect(component.form.controls.evaluationCriteria.value).toEqual([{
      name: 'Revenue',
      points: 10,
      subtree: 'fact Sales { amount };',
      partialSolution: true,
      allowIncorrectFactClass: false
    }]);
    expect(component.form.value.allowGrading).toBe(true);
    expect(component.form.value.checkNames).toBe(true);
  });

  it('should allow no evaluation criteria', () => {
    component.formData = {
      solution: 'fact Sales { amount };',
      evaluationCriteria: []
    };

    expect(component.evaluationCriteria.valid).toBe(true);
    expect(component.evaluationCriteria.errors).toBeNull();
  });

  it('should reject invalid criteria point totals', () => {
    component.formData = {
      solution: 'fact Sales { amount };',
      evaluationCriteria: [{
        name: 'Revenue',
        points: 9,
        subtree: 'fact Sales { amount };',
        partialSolution: false,
        allowIncorrectFactClass: false
      }]
    };

    expect(component.evaluationCriteria.hasError('pointsTotalMismatch')).toBe(true);
    expect(component.form.invalid).toBe(true);

    component.parentForm?.controls.maxPoints.setValue(9);
    expect(component.evaluationCriteria.hasError('pointsTotalMismatch')).toBe(false);
  });

  it('should validate DFM syntax and the solution length', () => {
    component.form.controls.solution.setValue(
      'fact Sales { amount }; dimension Calendar { Year - Month }; Sales - Calendar;'
    );
    expect(component.form.controls.solution.valid).toBe(true);

    component.form.controls.solution.setValue('not a valid DFM model');
    expect(component.form.controls.solution.hasError('dfmSyntax')).toBe(true);

    component.form.controls.solution.setValue('x'.repeat(5001));
    expect(component.form.controls.solution.hasError('maxlength')).toBe(true);

    component.formData = {
      solution: 'fact Sales { amount };',
      evaluationCriteria: [{
        name: 'Revenue',
        points: 10,
        subtree: 'not a valid DFM model',
        partialSolution: false,
        allowIncorrectFactClass: false
      }]
    };
    expect(component.evaluationCriteria.at(0).controls.subtree.hasError('dfmSyntax')).toBe(true);
  });

  it('should reject whitespace-only criterion names and submodels', () => {
    component.formData = {
      solution: 'fact Sales { amount };',
      evaluationCriteria: [{
        name: '   ',
        points: 10,
        subtree: '   ',
        partialSolution: false,
        allowIncorrectFactClass: false
      }]
    };

    const criterion = component.evaluationCriteria.at(0);
    expect(criterion.controls.name.hasError('required')).toBe(true);
    expect(criterion.controls.subtree.hasError('required')).toBe(true);
  });
});

function createParentForm(maxPoints: number): FormGroup<TaskForm> {
  return new FormGroup<TaskForm>({
    organizationalUnitId: new FormControl<number | null>(1),
    title: new FormControl<string | null>('DFM task'),
    descriptionDe: new FormControl<string | null>(''),
    descriptionEn: new FormControl<string | null>(''),
    difficulty: new FormControl<number | null>(1),
    maxPoints: new FormControl<number | null>(maxPoints),
    taskType: new FormControl<string | null>('dfm'),
    status: new FormControl<StatusEnum | null>(StatusEnum.DRAFT),
    taskGroupId: new FormControl<number | null>(null),
    taskCategoryIds: new FormArray<FormControl<TreeNode | null>>([]),
    examTask: new FormControl<boolean | null>(false),
    additionalData: new UntypedFormGroup({})
  });
}
