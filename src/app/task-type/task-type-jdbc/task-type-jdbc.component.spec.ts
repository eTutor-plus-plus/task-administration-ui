import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormGroup, ReactiveFormsModule, FormControl, Validators, UntypedFormGroup } from '@angular/forms';
import { TaskTypeJDBCComponent } from './task-type-jdbc.component';
import { provideTransloco } from '@ngneat/transloco';
import { CheckboxModule } from 'primeng/checkbox';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { PaginatorModule } from 'primeng/paginator';
import { TaskGroupService } from '../../api';
import { of } from 'rxjs';
import { translocoTestConfig } from '../../translation-loader.service.spec';
import { provideHttpClient } from '@angular/common/http';

describe('TaskTypeJDBCComponent', () => {
  let component: TaskTypeJDBCComponent;
  let fixture: ComponentFixture<TaskTypeJDBCComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TaskTypeJDBCComponent,
        ReactiveFormsModule,
        CheckboxModule,
        InputNumberModule,
        InputTextModule,
        MonacoEditorModule.forRoot({}),
        PaginatorModule,
      ],
      providers: [
        provideTransloco(translocoTestConfig),
        { provide: TaskGroupService, useValue: { get: () => of({}) } },
        provideHttpClient(),
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTypeJDBCComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  
  });

  it('should create all penalty controls with default values', () => {
    const form = component.form;

    expect(form.get('wrongOutputPenalty')).toBeTruthy();
    expect(form.get('exceptionHandlingPenalty')).toBeTruthy();
    expect(form.get('wrongDbContentPenalty')).toBeTruthy();
    expect(form.get('checkAutocommit')).toBeTruthy();
    expect(form.get('autocommitPenalty')).toBeTruthy();
    expect(form.get('autocommitPenalty')?.disabled).toBeTruthy();
  });

  it('should enable autocommitPenalty when checkbox is checked', () => {
    const checkbox = component.form.get('checkAutocommit');
    const penaltyControl = component.form.get('autocommitPenalty');

    checkbox?.setValue(true);
    fixture.detectChanges();

    expect(penaltyControl?.enabled).toBeTruthy();
  });

  it('should disable and reset autocommitPenalty when checkbox is unchecked', () => {
    const checkbox = component.form.get('checkAutocommit');
    const penaltyControl = component.form.get('autocommitPenalty');

    checkbox?.setValue(true);
    penaltyControl?.setValue(5);
    fixture.detectChanges();

    checkbox?.setValue(false);
    fixture.detectChanges();

    expect(penaltyControl?.disabled).toBeTruthy();
    expect(penaltyControl?.value).toBeNull();
  });

  it('should require all numeric penalty fields to be ≥ 0', () => {
    const form = component.form;

    form.get('wrongOutputPenalty')?.setValue(-1);
    form.get('exceptionHandlingPenalty')?.setValue(-1);
    form.get('wrongDbContentPenalty')?.setValue(-1);
    form.get('autocommitPenalty')?.enable();
    form.get('autocommitPenalty')?.setValue(-1);

    fixture.detectChanges();

    expect(form.get('wrongOutputPenalty')?.valid).toBeFalsy();
    expect(form.get('exceptionHandlingPenalty')?.valid).toBeFalsy();
    expect(form.get('wrongDbContentPenalty')?.valid).toBeFalsy();
    expect(form.get('autocommitPenalty')?.valid).toBeFalsy();
  });

  it('should accept valid numbers ≥ 0 for all penalties', () => {
    const form = component.form;
  
    form.get('wrongOutputPenalty')?.setValue(2);
    form.get('exceptionHandlingPenalty')?.setValue(3);
    form.get('wrongDbContentPenalty')?.setValue(4);
    form.get('checkAutocommit')?.setValue(true);
    fixture.detectChanges();
  
    form.get('autocommitPenalty')?.setValue(1);
  
    form.get('solution')?.setValue('SELECT * FROM test;');
    form.get('tables')?.setValue('test');  
    fixture.detectChanges();
  
    expect(form.valid).toBeTruthy();
  });
  
  it('should have an optional variables field', () => {
    const variablesControl = component.form.get('variables');
    expect(variablesControl).toBeTruthy();
    expect([null, '']).toContain(variablesControl?.value);
    expect(variablesControl?.valid).toBeTruthy();
    variablesControl?.setValue('int book = 1; int user = 42;');
    expect(variablesControl?.valid).toBeTruthy();
  });

  
});
