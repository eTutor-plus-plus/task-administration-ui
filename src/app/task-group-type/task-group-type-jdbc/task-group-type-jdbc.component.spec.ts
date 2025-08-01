import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTransloco } from '@ngneat/transloco';
import { translocoTestConfig } from '../../translation-loader.service.spec';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { TaskGroupTypeJDBCComponent } from './task-group-type-jdbc.component';
import { provideHttpClient } from '@angular/common/http';
import { UntypedFormGroup } from '@angular/forms';
import { API_URL } from '../../app.config';

describe('TaskGroupTypeJDBCComponent', () => {
  let component: TaskGroupTypeJDBCComponent;
  let fixture: ComponentFixture<TaskGroupTypeJDBCComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TaskGroupTypeJDBCComponent,
        MonacoEditorModule.forRoot({})
      ],
      providers: [
        provideTransloco(translocoTestConfig),
        provideHttpClient(),
        { provide: API_URL, useValue: 'http://localhost/api' },
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskGroupTypeJDBCComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize all required form controls', () => {
    const form = component.form;
    expect(form.contains('createStatements')).toBeTruthy();
    expect(form.contains('insertStatementsDiagnose')).toBeTruthy();
    expect(form.contains('insertStatementsSubmission')).toBeTruthy();
  });

  it('should require all form fields (validators)', () => {
    const form = component.form;

    form.get('createStatements')?.setValue(null);
    form.get('insertStatementsDiagnose')?.setValue(null);
    form.get('insertStatementsSubmission')?.setValue(null);

    expect(form.valid).toBeFalsy();
    expect(form.get('createStatements')?.valid).toBeFalsy();
    expect(form.get('insertStatementsDiagnose')?.valid).toBeFalsy();
    expect(form.get('insertStatementsSubmission')?.valid).toBeFalsy();
  });

  it('should be valid if all required fields are filled', () => {
    const form = component.form;

    form.get('createStatements')?.setValue('CREATE TABLE test (id INT);');
    form.get('insertStatementsDiagnose')?.setValue("INSERT INTO test VALUES (1);");
    form.get('insertStatementsSubmission')?.setValue("INSERT INTO test VALUES (2);");

    expect(form.valid).toBeTruthy();
  });
});
