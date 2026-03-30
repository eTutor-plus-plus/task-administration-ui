import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeIntensionalSchemaComponent } from './task-type-intensional-schema.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskTypeIntensionalSchemaComponent', () => {
  let component: TaskTypeIntensionalSchemaComponent;
  let fixture: ComponentFixture<TaskTypeIntensionalSchemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeIntensionalSchemaComponent, MonacoEditorModule.forRoot({})],
      providers: [
        provideTransloco(translocoTestConfig)
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

  it('should add and remove solution aspects', () => {
    fixture.detectChanges();
    expect(component.solutionAspects.length).toBe(0);

    component.addSolution();
    expect(component.solutionAspects.length).toBe(1);

    component.removeSolution(0);
    expect(component.solutionAspects.length).toBe(0);
  });

  it('should have declareStatement control on each new aspect', () => {
    fixture.detectChanges();
    component.addSolution();
    const grp = component.solutionAspects.at(0);
    expect(grp.get('declareStatement')).toBeTruthy();
    expect(grp.get('declareStatement')?.value).toBeNull();
  });

  it('isTypeBody returns false for Type Specification', () => {
    fixture.detectChanges();
    component.addSolution();
    component.solutionAspects.at(0).get('solutionType')?.setValue('Type Specification');
    expect(component.isTypeBody(0)).toBe(false);
  });

  it('isTypeBody returns true for Type Body', () => {
    fixture.detectChanges();
    component.addSolution();
    component.solutionAspects.at(0).get('solutionType')?.setValue('Type Body');
    expect(component.isTypeBody(0)).toBe(true);
  });

  it('asFormControl should cast AbstractControl to FormControl', () => {
    fixture.detectChanges();
    component.addSolution();
    const ctrl = component.solutionAspects.at(0).get('declareStatement');
    const cast = component.asFormControl(ctrl as any);
    expect(cast).toBe(ctrl);
  });

  it('should load solution aspects from originalData', () => {
    fixture.detectChanges();
    component.formData = {
      solutionAspects: [
        {
          solutionName: 'Aspect 1',
          solutionType: 'Type Body',
          solutionMaxPoints: 10,
          solution: 'SELECT 1',
          declareStatement: 'DECLARE x INT;',
          taskSolutionAspects: []
        }
      ]
    };
    expect(component.solutionAspects.length).toBe(1);
    const grp = component.solutionAspects.at(0);
    expect(grp.get('solutionName')?.value).toBe('Aspect 1');
    expect(grp.get('declareStatement')?.value).toBe('DECLARE x INT;');
  });
});
