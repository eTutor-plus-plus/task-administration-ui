import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskGroupTypeCypherComponent } from './task-group-type-cypher.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskGroupTypeCypherComponent', () => {
  let component: TaskGroupTypeCypherComponent;
  let fixture: ComponentFixture<TaskGroupTypeCypherComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TaskGroupTypeCypherComponent,
        MonacoEditorModule.forRoot({})
      ],
      providers: [
        provideTransloco(translocoTestConfig)
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskGroupTypeCypherComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toEqual(['setupStatements', 'secondarySetupStatements']);
  });

  it('should be invalid when setupStatements is empty', () => {
    expect(component.form.controls.setupStatements.invalid).toBe(true);
  });

  it('should be valid when both setup fields are set', () => {
    component.form.controls.setupStatements.setValue("CREATE (:Person {name: 'Alice'});");
    component.form.controls.secondarySetupStatements.setValue("CREATE (:Person {name: 'Carol'});");
    expect(component.form.valid).toBe(true);
  });

  it('should be invalid when secondarySetupStatements is empty', () => {
    component.form.controls.setupStatements.setValue("CREATE (:Person {name: 'Alice'});");
    expect(component.form.controls.secondarySetupStatements.invalid).toBe(true);
  });

  it('should show error if setupStatements is empty and dirty', () => {
    component.form.controls.setupStatements.markAsDirty();
    fixture.detectChanges();

    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });
});
