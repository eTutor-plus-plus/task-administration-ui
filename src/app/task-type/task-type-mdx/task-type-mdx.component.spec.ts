import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeMdxComponent } from './task-type-mdx.component';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { provideTransloco } from '@ngneat/transloco';
import { translocoTestConfig } from '../../translation-loader.service.spec';
import { UntypedFormGroup } from '@angular/forms';

describe('TaskTypeMdxComponent', () => {
  let component: TaskTypeMdxComponent;
  let fixture: ComponentFixture<TaskTypeMdxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeMdxComponent, MonacoEditorModule.forRoot({})],
      providers: [provideTransloco(translocoTestConfig)]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTypeMdxComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toHaveLength(3);
    expect(component.form.contains('solutions')).toBe(true);
    expect(component.form.contains('wrongOrderPenalty')).toBe(true);
    expect(component.form.contains('wrongFormatPenalty')).toBe(true);
  });

  it('should set default values', () => {
    component.formData = undefined;

    expect(component.form.value.wrongOrderPenalty).toBe(0);
    expect(component.form.value.wrongFormatPenalty).toBe(0);
  });

  it('should validate wrongOrderPenalty is required', () => {
    const ctrl = component.form.controls.wrongOrderPenalty;
    ctrl.setValue(null);
    ctrl.markAsDirty();

    fixture.detectChanges();
    expect(ctrl.invalid).toBe(true);
  });

  it('should validate wrongFormatPenalty is required', () => {
    const ctrl = component.form.controls.wrongFormatPenalty;
    ctrl.setValue(null);
    ctrl.markAsDirty();

    fixture.detectChanges();
    expect(ctrl.invalid).toBe(true);
  });

  it('should validate wrongOrderPenalty >= 0', () => {
    const ctrl = component.form.controls.wrongOrderPenalty;
    ctrl.setValue(-2);
    ctrl.markAsDirty();

    fixture.detectChanges();
    expect(ctrl.invalid).toBe(true);
  });

  it('should validate wrongFormatPenalty >= 0', () => {
    const ctrl = component.form.controls.wrongFormatPenalty;
    ctrl.setValue(-2);
    ctrl.markAsDirty();

    fixture.detectChanges();
    expect(ctrl.invalid).toBe(true);
  });

  it('should add and remove solutions', () => {
    expect(component.solutions.length).toBe(0);

    component.addSolution();
    expect(component.solutions.length).toBe(1);

    component.removeSolution(0);
    expect(component.solutions.length).toBe(0);
  });
});
