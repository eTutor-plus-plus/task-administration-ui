import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';

import { TaskTypeOwlComponent } from './task-type-owl.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';
import { TaskGroupService } from '../../api';
import { TaskForm } from '../task.form';

describe('TaskTypeOwlComponent', () => {
  let component: TaskTypeOwlComponent;
  let fixture: ComponentFixture<TaskTypeOwlComponent>;
  const tgFn = jest.fn();

  beforeEach(async () => {
    tgFn.mockClear();

    await TestBed.configureTestingModule({
      imports: [TaskTypeOwlComponent],
      providers: [
        provideTransloco(translocoTestConfig),
        {provide: TaskGroupService, useValue: {get: tgFn}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTypeOwlComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toHaveLength(1);
  });

  it('should show error if solution is empty', () => {
    // Arrange
    component.form.controls.solution.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.solution.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if solution out of bounds', async () => {
    // Arrange
    tgFn.mockResolvedValue({
      additionalData: {
        minNumber: 1,
        maxNumber: 100
      },
      dto: {
        taskGroupType: 'binary-search'
      }
    });
    const parentForm: FormGroup<TaskForm> = new UntypedFormGroup({
      taskGroupId: new FormControl<number | null>(null)
    });
    component.parentForm = parentForm;
    component.ngOnChanges({
      parentForm: new SimpleChange(undefined, parentForm, true)
    });// not called automatically during tests.
    parentForm.patchValue({taskGroupId: 2});
    await new Promise(f => setTimeout(f, 500)); // wait for task group data to load

    component.form.controls.solution.setValue(300);
    component.form.controls.solution.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.solution.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should not show error if task group is invalid', () => {
    // Arrange
    tgFn.mockResolvedValue({
      additionalData: {},
      dto: {
        taskGroupType: 'sql'
      }
    });
    const parentForm: FormGroup<TaskForm> = new UntypedFormGroup({
      taskGroupId: new FormControl<number | null>(null)
    });
    component.parentForm = parentForm;
    component.ngOnChanges({
      parentForm: new SimpleChange(undefined, parentForm, true)
    });// not called automatically during tests.
    parentForm.patchValue({taskGroupId: 2});
    component.form.controls.solution.setValue(300);
    component.form.controls.solution.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.solution.invalid).toBe(false);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeDefined();
    expect(msg?.innerText.trim()).toHaveLength(0);
  });

  it('should not show error if task group could not be loaded', () => {
    // Arrange
    tgFn.mockResolvedValue('some error');
    const parentForm: FormGroup<TaskForm> = new UntypedFormGroup({
      taskGroupId: new FormControl<number | null>(null)
    });
    component.parentForm = parentForm;
    component.ngOnChanges({
      parentForm: new SimpleChange(undefined, parentForm, true)
    });// not called automatically during tests.
    parentForm.patchValue({taskGroupId: 2});
    component.form.controls.solution.setValue(300);
    component.form.controls.solution.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.solution.invalid).toBe(false);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeDefined();
    expect(msg?.innerText.trim()).toHaveLength(0);
  });
});
