import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeRelalgComponent } from './task-type-relalg.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskTypeRelalgComponent', () => {
  let component: TaskTypeRelalgComponent;
  let fixture: ComponentFixture<TaskTypeRelalgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeRelalgComponent, MonacoEditorModule.forRoot({})],
      providers: [provideTransloco(translocoTestConfig)]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTypeRelalgComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toHaveLength(3);
  });

  it('should provide sql solution if original data is set', () => {
    // Arrange
    const expected = 'SELECT * FROM employees;';
    component.formData = {solution: '', sqlSolution: expected};
    fixture.detectChanges();

    // Act
    const solution = component.sqlSolution;

    // Assert
    expect(solution).toEqual(expected);

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('#sqlSolution')).toBeDefined();
  });

  it('should provide undefined sql solution if original data is not set', () => {
    // Act
    const solution = component.sqlSolution;

    // Assert
    expect(solution).toBeUndefined();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelector('#sqlSolution')).toBeFalsy();
  });

  it('should set default values', () => {
    // Act
    component.formData = undefined;

    // Assert
    expect(component.form.value.wrongOrderPenalty).toBe(-1);
    expect(component.form.value.superfluousColumnsPenalty).toBe(-1);
  });

  it('should show error if solution is empty', () => {
    // Arrange
    component.form.controls.solution.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#solution + .p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if wrongOrderPenalty is empty', () => {
    // Arrange
    component.form.controls.wrongOrderPenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if superfluousColumnsPenalty is empty', () => {
    // Arrange
    component.form.controls.superfluousColumnsPenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if wrongOrderPenalty < -1', () => {
    // Arrange
    component.form.controls.wrongOrderPenalty.setValue(-2);
    component.form.controls.wrongOrderPenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if superfluousColumnsPenalty < -1', () => {
    // Arrange
    component.form.controls.superfluousColumnsPenalty.setValue(-2);
    component.form.controls.superfluousColumnsPenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });
});
