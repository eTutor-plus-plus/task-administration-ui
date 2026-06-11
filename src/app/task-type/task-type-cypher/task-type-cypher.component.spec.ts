import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeCypherComponent } from './task-type-cypher.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskTypeCypherComponent', () => {
  let component: TaskTypeCypherComponent;
  let fixture: ComponentFixture<TaskTypeCypherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TaskTypeCypherComponent,
        MonacoEditorModule.forRoot({})
      ],
      providers: [
        provideTransloco(translocoTestConfig)
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTypeCypherComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toEqual([
      'evaluationMode',
      'solution',
      'superfluousColumnsPenalty',
      'missingRowsPenalty',
      'superfluousRowsPenalty',
      'wrongOrderPenalty',
      'expectedColumnNames',
      'alternativeSolutions'
    ]);
  });

  it('should default to PENALTY mode with 100 % penalties', () => {
    component.formData = undefined;

    expect(component.form.value.evaluationMode).toBe('PENALTY');
    expect(component.isMultiSolution).toBe(false);
    expect(component.form.value.superfluousColumnsPenalty).toBe(100);
    expect(component.form.value.missingRowsPenalty).toBe(100);
    expect(component.form.value.superfluousRowsPenalty).toBe(100);
    expect(component.form.value.wrongOrderPenalty).toBe(100);
    expect(component.alternativeSolutions.length).toBe(0);
  });

  it('PENALTY mode: solution is required', () => {
    component.formData = undefined;
    expect(component.form.controls.solution.invalid).toBe(true);

    component.form.controls.solution.setValue('MATCH (p:Person) RETURN p.name');
    expect(component.form.valid).toBe(true);
  });

  it('PENALTY mode: rejects penalties outside 0..100', () => {
    component.form.controls.missingRowsPenalty.setValue(-1);
    expect(component.form.controls.missingRowsPenalty.invalid).toBe(true);
    component.form.controls.missingRowsPenalty.setValue(101);
    expect(component.form.controls.missingRowsPenalty.invalid).toBe(true);
  });

  it('switching to MULTI_SOLUTION drops the solution-required validator', () => {
    component.formData = undefined;
    component.form.controls.evaluationMode.setValue('MULTI_SOLUTION');
    // solution may stay null without invalidating the form (alternatives take its place)
    expect(component.form.controls.solution.invalid).toBe(false);
    // but the array-level validator now demands at least one alternative
    expect(component.alternativeSolutions.errors).toEqual({ alternativesEmpty: true });
  });

  it('MULTI_SOLUTION: addAlternative seeds 100 % for the first entry', () => {
    component.formData = undefined;
    component.form.controls.evaluationMode.setValue('MULTI_SOLUTION');
    component.addAlternative();

    expect(component.alternativeSolutions.length).toBe(1);
    expect(component.alternativeAt(0).controls.pointsPercent.value).toBe(100);
    // still missing the solution text — list itself is now valid, but the inner control is not
    expect(component.alternativeAt(0).controls.solution.invalid).toBe(true);
  });

  it('MULTI_SOLUTION: accepts entries in any order (backend re-sorts by points)', () => {
    component.formData = undefined;
    component.form.controls.evaluationMode.setValue('MULTI_SOLUTION');
    component.addAlternative();
    component.addAlternative();
    // Lower-value entry first — the order is irrelevant as long as a 100 % entry exists.
    component.alternativeAt(0).patchValue({ solution: 'MATCH (p) RETURN p.name', pointsPercent: 60 });
    component.alternativeAt(1).patchValue({ solution: 'MATCH (p) RETURN p', pointsPercent: 100 });

    expect(component.alternativeSolutions.errors).toBeNull();
    expect(component.form.valid).toBe(true);
  });

  it('MULTI_SOLUTION: rejects when no entry awards 100 %', () => {
    component.formData = undefined;
    component.form.controls.evaluationMode.setValue('MULTI_SOLUTION');
    component.addAlternative();
    component.alternativeAt(0).patchValue({ solution: 'MATCH (p) RETURN p', pointsPercent: 90 });

    expect(component.alternativeSolutions.errors).toEqual({ alternativesNoHundred: true });
  });

  it('MULTI_SOLUTION: accepts duplicate 100 % entries', () => {
    component.formData = undefined;
    component.form.controls.evaluationMode.setValue('MULTI_SOLUTION');
    component.addAlternative();
    component.addAlternative();
    component.alternativeAt(0).patchValue({ solution: 'MATCH (p) RETURN p.name', pointsPercent: 100 });
    component.alternativeAt(1).patchValue({ solution: 'MATCH (p) RETURN p.age', pointsPercent: 100 });

    expect(component.alternativeSolutions.errors).toBeNull();
    expect(component.form.valid).toBe(true);
  });

  it('removeAlternative and moveAlternative manipulate the array correctly', () => {
    component.formData = undefined;
    component.form.controls.evaluationMode.setValue('MULTI_SOLUTION');
    component.addAlternative();
    component.addAlternative();
    component.addAlternative();
    component.alternativeAt(0).patchValue({ solution: 'A', pointsPercent: 100 });
    component.alternativeAt(1).patchValue({ solution: 'B', pointsPercent: 60 });
    component.alternativeAt(2).patchValue({ solution: 'C', pointsPercent: 30 });

    component.moveAlternative(1, 1);
    expect(component.alternativeAt(0).value.solution).toBe('A');
    expect(component.alternativeAt(1).value.solution).toBe('C');
    expect(component.alternativeAt(2).value.solution).toBe('B');

    component.removeAlternative(2);
    expect(component.alternativeSolutions.length).toBe(2);
    expect(component.alternativeAt(1).value.solution).toBe('C');
  });

  it('formData restores existing alternatives', () => {
    component.form.controls.evaluationMode.setValue('MULTI_SOLUTION');
    component.formData = {
      evaluationMode: 'MULTI_SOLUTION',
      alternativeSolutions: [
        { solution: 'MATCH (p) RETURN p.name, p.age', pointsPercent: 100 },
        { solution: 'MATCH (p) RETURN p.name', pointsPercent: 50 }
      ]
    };

    expect(component.alternativeSolutions.length).toBe(2);
    expect(component.alternativeAt(0).value.pointsPercent).toBe(100);
    expect(component.alternativeAt(1).value.solution).toBe('MATCH (p) RETURN p.name');
  });
});
