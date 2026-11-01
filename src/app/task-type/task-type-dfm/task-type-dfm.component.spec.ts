import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTransloco } from '@ngneat/transloco';
import { FormArray, FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { TreeNode } from 'primeng/api';

import { TaskTypeDfmComponent } from './task-type-dfm.component';
import { StatusEnum } from '../../api';
import { TranslationLoaderService } from '../../translation-loader.service';
import { TaskForm } from '../task.form';

describe('TaskTypeDfmComponent', () => {
  let component: TaskTypeDfmComponent;
  let fixture: ComponentFixture<TaskTypeDfmComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeDfmComponent],
      providers: [
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

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(component.form.controls.allowGrading).toBeDefined();
    expect(component.form.controls.checkNames).toBeDefined();
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
