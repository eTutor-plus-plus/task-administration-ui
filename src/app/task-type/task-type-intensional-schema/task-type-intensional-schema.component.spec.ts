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
    fixture.detectChanges();
  });

  // --- Form Initialization ---

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize 4 form controls', () => {
    expect(Object.keys(component.form.controls)).toHaveLength(4);
    expect(component.form.get('dmlStatements')).toBeTruthy();
    expect(component.form.get('diagnoseDmlStatements')).toBeTruthy();
    expect(component.form.get('submitDmlStatements')).toBeTruthy();
    expect(component.form.get('solutionAspects')).toBeTruthy();
  });

  it('should start with empty solution aspects', () => {
    expect(component.solutionAspects.length).toBe(0);
  });

  // --- Solution CRUD ---

  it('should add a solution with default controls', () => {
    component.addSolution();
    expect(component.solutionAspects.length).toBe(1);

    const grp = component.solutionAspects.at(0);
    expect(grp.get('solutionName')).toBeTruthy();
    expect(grp.get('solutionType')).toBeTruthy();
    expect(grp.get('solutionMaxPoints')).toBeTruthy();
    expect(grp.get('solution')).toBeTruthy();
    expect(grp.get('showEval')).toBeTruthy();
    expect(grp.get('taskSolutionAspects')).toBeTruthy();
    expect(grp.get('typeBodyEntries')).toBeTruthy();
  });

  it('should default solutionType to Type Specification', () => {
    component.addSolution();
    expect(component.solutionAspects.at(0).get('solutionType')?.value).toBe('Type Specification');
  });

  it('should remove a solution', () => {
    component.addSolution();
    component.addSolution();
    expect(component.solutionAspects.length).toBe(2);

    component.removeSolution(0);
    expect(component.solutionAspects.length).toBe(1);
  });

  // --- isTypeBody ---

  it('should return false for Type Specification', () => {
    component.addSolution();
    component.solutionAspects.at(0).get('solutionType')?.setValue('Type Specification');
    expect(component.isTypeBody(0)).toBe(false);
  });

  it('should return true for Type Body', () => {
    component.addSolution();
    component.solutionAspects.at(0).get('solutionType')?.setValue('Type Body');
    expect(component.isTypeBody(0)).toBe(true);
  });

  // --- Evaluation Aspects ---

  it('should add and remove evaluation aspects', () => {
    component.addSolution();
    expect(component.getEvaluations(0).length).toBe(0);

    component.addEvaluation(0);
    expect(component.getEvaluations(0).length).toBe(1);

    component.addEvaluation(0);
    expect(component.getEvaluations(0).length).toBe(2);

    component.removeEvaluation(0, 0);
    expect(component.getEvaluations(0).length).toBe(1);
  });

  it('should create evaluation with correct controls', () => {
    component.addSolution();
    component.addEvaluation(0);

    const eval0 = component.getEvaluations(0).at(0);
    expect(eval0.get('solutionAspectName')).toBeTruthy();
    expect(eval0.get('solutionAspectPoints')).toBeTruthy();
  });

  // --- Type Body Entries ---

  it('should add and remove type body entries', () => {
    component.addSolution();
    expect(component.getTypeBodyEntries(0).length).toBe(0);

    component.addTypeBodyEntry(0);
    expect(component.getTypeBodyEntries(0).length).toBe(1);

    component.addTypeBodyEntry(0);
    expect(component.getTypeBodyEntries(0).length).toBe(2);

    component.removeTypeBodyEntry(0, 0);
    expect(component.getTypeBodyEntries(0).length).toBe(1);
  });

  it('should create type body entry with correct controls', () => {
    component.addSolution();
    component.addTypeBodyEntry(0);

    const entry = component.getTypeBodyEntries(0).at(0);
    expect(entry.get('methodName')).toBeTruthy();
    expect(entry.get('targetTable')).toBeTruthy();
    expect(entry.get('declareStatement')).toBeTruthy();
    expect(entry.get('declareStatement')?.value).toBeNull();
  });

  // --- toggleSolutionEval ---

  it('should toggle showEval and add an empty evaluation on first open', () => {
    component.addSolution();
    expect(component.solutionAspects.at(0).get('showEval')?.value).toBe(false);

    component.toggleSolutionEval(0);
    expect(component.solutionAspects.at(0).get('showEval')?.value).toBe(true);
    expect(component.getEvaluations(0).length).toBe(1);
  });

  it('should toggle showEval off without removing evaluations', () => {
    component.addSolution();
    component.toggleSolutionEval(0);
    expect(component.getEvaluations(0).length).toBe(1);

    component.toggleSolutionEval(0);
    expect(component.solutionAspects.at(0).get('showEval')?.value).toBe(false);
    expect(component.getEvaluations(0).length).toBe(1);
  });

  it('should not add duplicate evaluation when toggling on with existing evaluations', () => {
    component.addSolution();
    component.toggleSolutionEval(0);
    component.addEvaluation(0);
    expect(component.getEvaluations(0).length).toBe(2);

    component.toggleSolutionEval(0); // off
    component.toggleSolutionEval(0); // on again
    expect(component.getEvaluations(0).length).toBe(2);
  });

  // --- recalculateMaxPoints ---

  it('should recalculate max points from aspect points', () => {
    component.addSolution();
    component.addEvaluation(0);
    component.addEvaluation(0);

    component.getEvaluations(0).at(0).get('solutionAspectPoints')?.setValue(3);
    component.getEvaluations(0).at(1).get('solutionAspectPoints')?.setValue(2);
    component.recalculateMaxPoints(0);

    expect(component.solutionAspects.at(0).get('solutionMaxPoints')?.value).toBe(5);
  });

  it('should set max points to 0 when no evaluations exist', () => {
    component.addSolution();
    component.solutionAspects.at(0).get('solutionMaxPoints')?.setValue(99);
    component.recalculateMaxPoints(0);

    expect(component.solutionAspects.at(0).get('solutionMaxPoints')?.value).toBe(0);
  });

  it('should recalculate when adding an evaluation', () => {
    component.addSolution();
    component.addEvaluation(0);
    component.getEvaluations(0).at(0).get('solutionAspectPoints')?.setValue(5);
    component.recalculateMaxPoints(0);

    component.addEvaluation(0);
    expect(component.solutionAspects.at(0).get('solutionMaxPoints')?.value).toBe(5);
  });

  it('should recalculate when removing an evaluation', () => {
    component.addSolution();
    component.addEvaluation(0);
    component.addEvaluation(0);
    component.getEvaluations(0).at(0).get('solutionAspectPoints')?.setValue(3);
    component.getEvaluations(0).at(1).get('solutionAspectPoints')?.setValue(2);
    component.recalculateMaxPoints(0);
    expect(component.solutionAspects.at(0).get('solutionMaxPoints')?.value).toBe(5);

    component.removeEvaluation(0, 1);
    expect(component.solutionAspects.at(0).get('solutionMaxPoints')?.value).toBe(3);
  });

  // --- asFormControl ---

  it('should cast AbstractControl to FormControl', () => {
    component.addSolution();
    const ctrl = component.solutionAspects.at(0).get('solutionName');
    expect(component.asFormControl(ctrl as any)).toBe(ctrl);
  });

  // --- loadSolutionAspects (via formData) ---

  it('should not crash when formData has no solutionAspects', () => {
    expect(() => { component.formData = {}; }).not.toThrow();
    expect(() => { component.formData = null; }).not.toThrow();
    expect(component.solutionAspects.length).toBe(0);
  });

  it('should load solution with string solutionType', () => {
    component.formData = {
      solutionAspects: [{
        solutionName: 'product_ty',
        solutionType: 'Type Body',
        solutionMaxPoints: 5,
        solution: 'CREATE TYPE BODY product_ty AS ...',
        taskSolutionAspects: [],
        typeBodyEntries: []
      }]
    };

    expect(component.solutionAspects.length).toBe(1);
    const grp = component.solutionAspects.at(0);
    expect(grp.get('solutionName')?.value).toBe('product_ty');
    expect(grp.get('solutionType')?.value).toBe('Type Body');
    expect(grp.get('solutionMaxPoints')?.value).toBe(5);
    expect(grp.get('solution')?.value).toBe('CREATE TYPE BODY product_ty AS ...');
  });

  it('should load solution with numeric solutionType', () => {
    component.formData = {
      solutionAspects: [{
        solutionName: 'test_ty',
        solutionType: 2,
        solution: 'DDL',
        taskSolutionAspects: [],
        typeBodyEntries: []
      }]
    };

    expect(component.solutionAspects.at(0).get('solutionType')?.value).toBe('Type Body');
  });

  it('should load solution with object solutionType', () => {
    component.formData = {
      solutionAspects: [{
        solutionName: 'test_ty',
        solutionType: { id: 1, name: 'Type Specification' },
        solution: 'DDL',
        taskSolutionAspects: [],
        typeBodyEntries: []
      }]
    };

    expect(component.solutionAspects.at(0).get('solutionType')?.value).toBe('Type Specification');
  });

  it('should load solution with object solutionType using id fallback', () => {
    component.formData = {
      solutionAspects: [{
        solutionName: 'test_ty',
        solutionType: { id: 2 },
        solution: 'DDL',
        taskSolutionAspects: [],
        typeBodyEntries: []
      }]
    };

    expect(component.solutionAspects.at(0).get('solutionType')?.value).toBe('Type Body');
  });

  it('should load taskSolutionAspects and set showEval to true', () => {
    component.formData = {
      solutionAspects: [{
        solutionName: 'product_ty',
        solutionType: 'Type Specification',
        solution: 'DDL',
        taskSolutionAspects: [
          { solutionAspectName: 'id', solutionAspectPoints: 3 },
          { solutionAspectName: 'name', solutionAspectPoints: 2 }
        ],
        typeBodyEntries: []
      }]
    };

    expect(component.solutionAspects.at(0).get('showEval')?.value).toBe(true);
    const evals = component.getEvaluations(0);
    expect(evals.length).toBe(2);
    expect(evals.at(0).get('solutionAspectName')?.value).toBe('id');
    expect(evals.at(0).get('solutionAspectPoints')?.value).toBe(3);
    expect(evals.at(1).get('solutionAspectName')?.value).toBe('name');
    expect(evals.at(1).get('solutionAspectPoints')?.value).toBe(2);
  });

  it('should not set showEval when taskSolutionAspects is empty', () => {
    component.formData = {
      solutionAspects: [{
        solutionName: 'product_ty',
        solutionType: 'Type Specification',
        solution: 'DDL',
        taskSolutionAspects: [],
        typeBodyEntries: []
      }]
    };

    expect(component.solutionAspects.at(0).get('showEval')?.value).toBe(false);
  });

  it('should load typeBodyEntries', () => {
    component.formData = {
      solutionAspects: [{
        solutionName: 'product_ty',
        solutionType: 'Type Body',
        solution: 'CREATE TYPE BODY ...',
        taskSolutionAspects: [],
        typeBodyEntries: [
          { methodName: 'get_price', targetTable: 'result_table', declareStatement: 'DECLARE x NUMBER;' },
          { methodName: 'set_name', targetTable: 'name_table', declareStatement: null }
        ]
      }]
    };

    const entries = component.getTypeBodyEntries(0);
    expect(entries.length).toBe(2);
    expect(entries.at(0).get('methodName')?.value).toBe('get_price');
    expect(entries.at(0).get('targetTable')?.value).toBe('result_table');
    expect(entries.at(0).get('declareStatement')?.value).toBe('DECLARE x NUMBER;');
    expect(entries.at(1).get('methodName')?.value).toBe('set_name');
    expect(entries.at(1).get('declareStatement')?.value).toBeNull();
  });

  it('should load multiple solutions', () => {
    component.formData = {
      solutionAspects: [
        { solutionName: 'product_ty', solutionType: 'Type Specification', solution: 'DDL1', taskSolutionAspects: [], typeBodyEntries: [] },
        { solutionName: 'product_ty_body', solutionType: 'Type Body', solution: 'DDL2', taskSolutionAspects: [], typeBodyEntries: [] }
      ]
    };

    expect(component.solutionAspects.length).toBe(2);
    expect(component.solutionAspects.at(0).get('solutionName')?.value).toBe('product_ty');
    expect(component.solutionAspects.at(1).get('solutionName')?.value).toBe('product_ty_body');
  });

  it('should clear previous solutions when formData is set again', () => {
    component.formData = {
      solutionAspects: [
        { solutionName: 'old_ty', solutionType: 'Type Specification', solution: 'DDL', taskSolutionAspects: [], typeBodyEntries: [] }
      ]
    };
    expect(component.solutionAspects.length).toBe(1);

    component.formData = {
      solutionAspects: [
        { solutionName: 'new_ty', solutionType: 'Type Body', solution: 'DDL2', taskSolutionAspects: [], typeBodyEntries: [] }
      ]
    };
    expect(component.solutionAspects.length).toBe(1);
    expect(component.solutionAspects.at(0).get('solutionName')?.value).toBe('new_ty');
  });
});
