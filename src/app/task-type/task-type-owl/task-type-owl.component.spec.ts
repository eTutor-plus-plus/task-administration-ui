import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';

import { TaskTypeOwlComponent } from './task-type-owl.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskTypeOwlComponent', () => {
  let component: TaskTypeOwlComponent;
  let fixture: ComponentFixture<TaskTypeOwlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeOwlComponent],
      providers: [provideTransloco(translocoTestConfig)]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTypeOwlComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toEqual([
      'solution', 'pointsPerClass', 'pointsPerRedundantAxiom', 'pointsPerUndefinedClass', 'pointsPerAxiomWithoutEntity'
    ]);
  });

  it('should require a solution and points per class', () => {
    expect(component.form.controls.solution.invalid).toBe(true);
    expect(component.form.controls.pointsPerClass.invalid).toBe(true);

    component.form.patchValue({solution: 'Class: A', pointsPerClass: 'A=1'});

    expect(component.form.controls.solution.valid).toBe(true);
    expect(component.form.controls.pointsPerClass.valid).toBe(true);
  });
});
