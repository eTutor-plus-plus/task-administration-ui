import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';

import { TaskTypeFormComponent } from './task-type-form.component';
import { translocoTestConfig } from '../translation-loader.service.spec';
import { TaskForm } from './task.form';
import { TaskDto, TaskGroupDto } from '../api';

describe('TaskTypeFormComponent', () => {
  let component: TestComponent;
  let fixture: ComponentFixture<TestComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [provideTransloco(translocoTestConfig)]
    }).compileComponents();

    fixture = TestBed.createComponent(TestComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should set form group', () => {
    // Arrange
    const form = new UntypedFormGroup({
      test: new FormControl(null, [])
    });
    form.patchValue({test: 'hello'});

    // Act
    component.formGroup = form;

    // Assert
    expect(component.form).toBeDefined();
    expect(component.form.controls?.solution).toBeDefined();
    expect((component.form.controls as any)?.test).toBeDefined();
    expect((component.form.value as any)?.test).toBeFalsy();
  });


  it('should set form group and set original data', () => {
    // Arrange
    const form = new UntypedFormGroup({});
    const originalData = {solution: 'SELECT 1;'};
    component.formData = originalData;

    // Act
    component.formGroup = form;

    // Assert
    expect(component.form).toBeDefined();
    expect(component.form.controls?.solution).toBeDefined();
    expect(component.form.value.solution).toBe(originalData.solution);
  });

  it('should set form data with form set', () => {
    // Arrange
    const originalData = {solution: 'SELECT 1;'};
    component.formGroup = new UntypedFormGroup({});

    // Act
    component.formData = originalData;

    // Assert
    expect(component.form).toBeDefined();
    expect(component.originalData).toBe(originalData);
    expect(component.form.value?.solution).toBe(originalData.solution);
    expect(component.onOriginalDataChangedCalled).toBe(true);
  });

  it('should set form data to undefined with form set', () => {
    // Arrange
    component.formGroup = new UntypedFormGroup({});

    // Act
    component.formData = {solution: 'a'};
    component.formData = undefined;

    // Assert
    expect(component.form).toBeDefined();
    expect(component.originalData).toBeUndefined();
    expect(component.form.value?.solution).toBe('SELECT 2;');
    expect(component.onOriginalDataChangedCalled).toBe(true);
  });

  it('should set form data with form unset', () => {
    // Arrange
    const originalData = {solution: 'SELECT 1;'};

    // Act
    component.formData = originalData;

    // Assert
    expect(component.originalData).toBe(originalData);
    expect(component.onOriginalDataChangedCalled).toBe(true);
  });

  it('should set task', () => {
    // Arrange
    const t: TaskDto = {
      id: 1,
      title: '',
      difficulty: 1,
      maxPoints: 1,
      moodleSynced: false,
      taskType: 'sql',
      descriptionDe: '',
      descriptionEn: '',
      status: 'APPROVED',
      organizationalUnitId: 1,
      createdBy: null,
      createdDate: null,
      lastModifiedBy: null,
      lastModifiedDate: null,
      examTask: false,
    };

    // Act
    component.task = t;

    // Assert
    expect(component.task).toBe(t);
    expect(component.onTaskChangedCalled).toBe(true);
  });

  it('should set parent form', () => {
    // Arrange
    const form: FormGroup<TaskForm> = new UntypedFormGroup({});

    // Act
    component.parentForm = form;

    // Assert
    expect(component.parentForm).toBeDefined();
  });

  it('should set loading', () => {
    component.loading = true;
    expect(component.loading).toBe(true);

    component.loading = false;
    expect(component.loading).toBe(false);
  });

  it('should set loading to true on start loading', () => {
    // Act
    component.startLoading();

    // Assert
    expect(component.loading).toBe(true);
  });

  it('should set loading to false on finish loading', () => {
    // Arrange
    component.startLoading();

    // Act
    component.finishLoading();

    // Assert
    expect(component.loading).toBe(false);
  });

  it('should set loading correctly based on counter', () => {
    expect(component.loading).toBe(false);

    component.startLoading();
    expect(component.loading).toBe(true);

    component.startLoading();
    expect(component.loading).toBe(true);

    component.finishLoading();
    expect(component.loading).toBe(true);

    component.finishLoading();
    expect(component.loading).toBe(false);

    component.finishLoading();
    expect(component.loading).toBe(false);
  });
});

@Component({standalone: true, template: ``})
class TestComponent extends TaskTypeFormComponent<TestForm> {
  onOriginalDataChangedCalled = false;
  onTaskChangedCalled = false;

  constructor() {
    super();
  }

  protected override initForm(): void {
    this.form.addControl('solution', new FormControl(null, []));
  }

  protected override onOriginalDataChanged(originalData: unknown | undefined) {
    this.onOriginalDataChangedCalled = true;
  }

  protected override onTaskChanged(taskGroup: TaskDto | undefined | null) {
    this.onTaskChangedCalled = true;
  }

  protected override getFormDefaultValues(): Partial<{ [K in keyof TestForm]: any }> | undefined {
    return {solution: 'SELECT 2;'};
  }

  override get loading(): boolean {
    return super.loading;
  }

  public override set loading(value: boolean) {
    super.loading = value;
  }

  public override startLoading() {
    super.startLoading();
  }

  public override finishLoading() {
    super.finishLoading();
  }
}

interface TestForm {
  solution: FormControl<string | null>;
}
