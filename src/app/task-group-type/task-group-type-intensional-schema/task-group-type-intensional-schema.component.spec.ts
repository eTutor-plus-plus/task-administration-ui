import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskGroupTypeIntensionalSchemaComponent } from './task-group-type-intensional-schema.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';
import { TaskGroupService } from '../../api';

describe('TaskGroupTypeIntensionalSchemaComponent', () => {
  let component: TaskGroupTypeIntensionalSchemaComponent;
  let fixture: ComponentFixture<TaskGroupTypeIntensionalSchemaComponent>;
  const tgFn = jest.fn();

  beforeEach(async () => {
    tgFn.mockClear();

    await TestBed.configureTestingModule({
      imports: [
        TaskGroupTypeIntensionalSchemaComponent,
        MonacoEditorModule.forRoot({})
      ],
      providers: [
        provideTransloco(translocoTestConfig),
        { provide: TaskGroupService, useValue: { get: tgFn } }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskGroupTypeIntensionalSchemaComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    // Do not call detectChanges here so tests can set taskGroup before ngOnInit when needed
  });

  it('should create and initialize form controls', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toHaveLength(7);
  });

  it('should add and remove declare statement entries', () => {
    fixture.detectChanges();
    expect(component.declareStmt.length).toBe(0);

    component.addDeclareStmtEntry();
    expect(component.declareStmt.length).toBe(1);

    component.removeDeclareStmtEntry(0);
    expect(component.declareStmt.length).toBe(0);

    // out of bounds removal should not throw or change length
    component.addDeclareStmtEntry();
    component.addDeclareStmtEntry();
    expect(component.declareStmt.length).toBe(2);
    component.removeDeclareStmtEntry(10);
    expect(component.declareStmt.length).toBe(2);
  });

  it('should load declareStmt from additionalData when declareStmt is an array', fakeAsync(() => {
    const tg = {
      id: 1,
      name: '',
      descriptionDe: '',
      descriptionEn: '',
      taskGroupType: 'intensional-schema',
      status: 'APPROVED',
      organizationalUnitId: 1,
      createdBy: null,
      createdDate: null,
      lastModifiedBy: null,
      lastModifiedDate: null
    } as any;

    tgFn.mockResolvedValue({ additionalData: { declareStmt: [{ statementName: 'n1', statement: 's1' }] } });

    component.taskGroup = tg;
    fixture.detectChanges();
    // wait for promise resolution
    tick();
    fixture.detectChanges();

    expect(component.declareStmt.length).toBe(1);
    const g = component.declareStmt.at(0);
    expect(g.get('statementName')?.value).toBe('n1');
    expect(g.get('statement')?.value).toBe('s1');
  }));

  it('should load declareStmt from additionalData when declareStmt is an object', fakeAsync(() => {
    const tg = {
      id: 2,
      name: '',
      descriptionDe: '',
      descriptionEn: '',
      taskGroupType: 'intensional-schema',
      status: 'APPROVED',
      organizationalUnitId: 1,
      createdBy: null,
      createdDate: null,
      lastModifiedBy: null,
      lastModifiedDate: null
    } as any;

    tgFn.mockResolvedValue({ additionalData: { declareStmt: { statementName: 'n2', statement: 's2' } } });

    component.taskGroup = tg;
    fixture.detectChanges();
    tick();
    fixture.detectChanges();

    expect(component.declareStmt.length).toBe(1);
    const g = component.declareStmt.at(0);
    expect(g.get('statementName')?.value).toBe('n2');
    expect(g.get('statement')?.value).toBe('s2');
  }));

  it('asFormControl should cast AbstractControl to FormControl', () => {
    fixture.detectChanges();
    component.addDeclareStmtEntry();
    const ctrl = component.declareStmt.at(0).get('statement');
    const cast = component.asFormControl(ctrl as any);
    expect(cast).toBe(ctrl);
  });
});
