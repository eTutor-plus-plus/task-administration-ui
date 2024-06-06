import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeDatalogComponent } from './task-type-datalog.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';
import { GradingStrategy } from '../task-type-xquery/grading-strategy.enum';

describe('TaskTypeDatalogComponent', () => {
  let component: TaskTypeDatalogComponent;
  let fixture: ComponentFixture<TaskTypeDatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeDatalogComponent, MonacoEditorModule.forRoot({})],
      providers: [provideTransloco(translocoTestConfig)]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTypeDatalogComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toHaveLength(9);
  });

  it('should set grading strategies', () => {
    expect(component.strategies).toHaveLength(3);
  });

  it('should set default values', () => {
    // Act
    component.formData = undefined;

    // Assert
    expect(component.form.value.missingPredicatePenalty).toBe(0);
    expect(component.form.value.missingPredicateStrategy).toBe(GradingStrategy.KO);
    expect(component.form.value.missingFactPenalty).toBe(0);
    expect(component.form.value.missingFactStrategy).toBe(GradingStrategy.KO);
    expect(component.form.value.superfluousFactPenalty).toBe(0);
    expect(component.form.value.superfluousFactStrategy).toBe(GradingStrategy.KO);
  });

  it('should show error if solution is empty', () => {
    // Arrange
    component.form.controls.solution.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.solution.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#solution + .text-color-secondary + .p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if query is empty', () => {
    // Arrange
    component.form.controls.query.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.query.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#query + .text-color-secondary + .p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if missingPredicateStrategy is empty', () => {
    // Arrange
    component.form.controls.missingPredicateStrategy.setValue(null);
    component.form.controls.missingPredicateStrategy.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.missingPredicateStrategy.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if missingPredicatePenalty is empty', () => {
    // Arrange
    component.form.controls.missingPredicatePenalty.setValue(null);
    component.form.controls.missingPredicatePenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.missingPredicatePenalty.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if missingPredicatePenalty < 0', () => {
    // Arrange
    component.form.controls.missingPredicatePenalty.setValue(-1);
    component.form.controls.missingPredicatePenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.missingPredicatePenalty.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if missingFactStrategy is empty', () => {
    // Arrange
    component.form.controls.missingFactStrategy.setValue(null);
    component.form.controls.missingFactStrategy.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.missingFactStrategy.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if missingFactPenalty is empty', () => {
    // Arrange
    component.form.controls.missingFactPenalty.setValue(null);
    component.form.controls.missingFactPenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.missingFactPenalty.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if missingFactPenalty < 0', () => {
    // Arrange
    component.form.controls.missingFactPenalty.setValue(-1);
    component.form.controls.missingFactPenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.missingFactPenalty.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if superfluousFactStrategy is empty', () => {
    // Arrange
    component.form.controls.superfluousFactStrategy.setValue(null);
    component.form.controls.superfluousFactStrategy.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.superfluousFactStrategy.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if superfluousFactPenalty is empty', () => {
    // Arrange
    component.form.controls.superfluousFactPenalty.setValue(null);
    component.form.controls.superfluousFactPenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.superfluousFactPenalty.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if superfluousFactPenalty < 0', () => {
    // Arrange
    component.form.controls.superfluousFactPenalty.setValue(-1);
    component.form.controls.superfluousFactPenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.superfluousFactPenalty.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });
});
