import { ComponentFixture, fakeAsync, flushMicrotasks, TestBed, tick } from '@angular/core/testing';
import { SimpleChange } from '@angular/core';
import { FormControl, FormGroup, UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeIntensionalSchemaComponent } from './task-type-intensional-schema.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';
import { TaskGroupService } from '../../api';
import { TaskForm } from '../task.form';

describe('TaskTypeIntensionalSchemaComponent', () => {
  let component: TaskTypeIntensionalSchemaComponent;
  let fixture: ComponentFixture<TaskTypeIntensionalSchemaComponent>;
  const tgFn = jest.fn();

  beforeEach(async () => {
    tgFn.mockClear();

    await TestBed.configureTestingModule({
      imports: [TaskTypeIntensionalSchemaComponent, MonacoEditorModule.forRoot({})],
      providers: [
        provideTransloco(translocoTestConfig),
        { provide: TaskGroupService, useValue: { get: tgFn } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTypeIntensionalSchemaComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
  });

  it('should create and initialize form controls', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toHaveLength(1);
  });

  it('should show error if solution is empty', () => {
    fixture.detectChanges();

    component.form.controls.solution.markAsDirty();
    fixture.detectChanges();

    expect(component.form.controls.solution.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if solution out of bounds', fakeAsync(() => {
    tgFn.mockResolvedValue({
      additionalData: {
        minNumber: 1,
        maxNumber: 100
      },
      dto: {
        taskGroupType: 'intensional-schema'
      }
    });

    const parentForm: FormGroup<TaskForm> = new UntypedFormGroup({
      taskGroupId: new FormControl<number | null>(null)
    });

    component.parentForm = parentForm;
    component.ngOnChanges({ parentForm: new SimpleChange(undefined, parentForm, true) } as any);

    // trigger value change to cause updateValidator to call TaskGroupService.get
    parentForm.patchValue({ taskGroupId: 2 });

    // allow microtasks/promises to resolve
    flushMicrotasks();
    tick();
    fixture.detectChanges();

    component.form.controls.solution.setValue(null);
    component.form.controls.solution.markAsDirty();
    fixture.detectChanges();

    expect(component.form.controls.solution.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  }));

  it('should not show error if task group is invalid', fakeAsync(() => {
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
    component.ngOnChanges({ parentForm: new SimpleChange(undefined, parentForm, true) } as any);

    parentForm.patchValue({ taskGroupId: 2 });
    flushMicrotasks();
    tick();
    fixture.detectChanges();

    component.form.controls.solution.setValue(null);
    component.form.controls.solution.markAsDirty();
    fixture.detectChanges();

    expect(component.form.controls.solution.invalid).toBe(false);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeDefined();
    expect(msg?.innerText.trim()).toHaveLength(0);
  }));

  it('should not show error if task group could not be loaded', fakeAsync(() => {
    tgFn.mockRejectedValue('some error');

    const parentForm: FormGroup<TaskForm> = new UntypedFormGroup({
      taskGroupId: new FormControl<number | null>(null)
    });

    component.parentForm = parentForm;
    component.ngOnChanges({ parentForm: new SimpleChange(undefined, parentForm, true) } as any);

    parentForm.patchValue({ taskGroupId: 2 });
    flushMicrotasks();
    tick();
    fixture.detectChanges();

    component.form.controls.solution.setValue(null);
    component.form.controls.solution.markAsDirty();
    fixture.detectChanges();

    expect(component.form.controls.solution.invalid).toBe(false);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeDefined();
    expect(msg?.innerText.trim()).toHaveLength(0);
  }));
});
