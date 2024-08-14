import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskGroupTypeSqlComponent } from './task-group-type-sql.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskGroupTypeSqlComponent', () => {
  let component: TaskGroupTypeSqlComponent;
  let fixture: ComponentFixture<TaskGroupTypeSqlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TaskGroupTypeSqlComponent,
        MonacoEditorModule.forRoot({})
      ],
      providers: [provideTransloco(translocoTestConfig)]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskGroupTypeSqlComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toHaveLength(3);
  });

  it('should show error if ddlStatements is empty', () => {
    // Arrange
    component.form.controls.ddlStatements.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.ddlStatements.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#ddlStatements + .p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if ddlStatements is too short', () => {
    // Arrange
    component.form.patchValue({ddlStatements: '123'});
    component.form.controls.ddlStatements.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.ddlStatements.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#ddlStatements + .p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if diagnoseDmlStatements is empty', () => {
    // Arrange
    component.form.controls.diagnoseDmlStatements.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.diagnoseDmlStatements.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#diagnoseDmlStatements + .p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if diagnoseDmlStatements is too short', () => {
    // Arrange
    component.form.patchValue({diagnoseDmlStatements: '123'});
    component.form.controls.diagnoseDmlStatements.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.diagnoseDmlStatements.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#diagnoseDmlStatements + .p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if submitDmlStatements is empty', () => {
    // Arrange
    component.form.controls.submitDmlStatements.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.submitDmlStatements.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#submitDmlStatements + .p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if submitDmlStatements is too short', () => {
    // Arrange
    component.form.patchValue({submitDmlStatements: '123'});
    component.form.controls.submitDmlStatements.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.submitDmlStatements.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#submitDmlStatements + .p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });
});
