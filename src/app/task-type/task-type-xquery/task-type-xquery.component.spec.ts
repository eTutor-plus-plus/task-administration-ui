import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeXqueryComponent } from './task-type-xquery.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';
import { GradingStrategy } from './grading-strategy.enum';

describe('TaskTypeXqueryComponent', () => {
  let component: TaskTypeXqueryComponent;
  let fixture: ComponentFixture<TaskTypeXqueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeXqueryComponent, MonacoEditorModule.forRoot({})],
      providers: [provideTransloco(translocoTestConfig)]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TaskTypeXqueryComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toHaveLength(16);
  });

  it('should set grading strategies', () => {
    expect(component.strategies).toHaveLength(3);
  });

  it('should set default values', () => {
    // Act
    component.formData = undefined;

    // Assert
    expect(component.form.value.missingNodePenalty).toBe(0);
    expect(component.form.value.missingNodeStrategy).toBe(GradingStrategy.KO);
    expect(component.form.value.superfluousNodePenalty).toBe(0);
    expect(component.form.value.superfluousNodeStrategy).toBe(GradingStrategy.KO);
    expect(component.form.value.displacedNodePenalty).toBe(0);
    expect(component.form.value.displacedNodeStrategy).toBe(GradingStrategy.KO);
    expect(component.form.value.missingAttributePenalty).toBe(0);
    expect(component.form.value.missingAttributeStrategy).toBe(GradingStrategy.KO);
    expect(component.form.value.superfluousAttributePenalty).toBe(0);
    expect(component.form.value.superfluousAttributeStrategy).toBe(GradingStrategy.KO);
    expect(component.form.value.incorrectAttributeValuePenalty).toBe(0);
    expect(component.form.value.incorrectAttributeValueStrategy).toBe(GradingStrategy.KO);
    expect(component.form.value.incorrectTextPenalty).toBe(0);
    expect(component.form.value.incorrectTextStrategy).toBe(GradingStrategy.KO);
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

  it('should show error if missingNodeStrategy is empty', () => {
    // Arrange
    component.form.controls.missingNodeStrategy.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if missingNodePenalty is empty', () => {
    // Arrange
    component.form.controls.missingNodePenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if missingNodePenalty < 0', () => {
    // Arrange
    component.form.controls.missingNodePenalty.setValue(-1);
    component.form.controls.missingNodePenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if superfluousNodeStrategy is empty', () => {
    // Arrange
    component.form.controls.superfluousNodeStrategy.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if superfluousNodePenalty is empty', () => {
    // Arrange
    component.form.controls.superfluousNodePenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if superfluousNodePenalty < 0', () => {
    // Arrange
    component.form.controls.superfluousNodePenalty.setValue(-1);
    component.form.controls.superfluousNodePenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if displacedNodeStrategy is empty', () => {
    // Arrange
    component.form.controls.displacedNodeStrategy.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if displacedNodePenalty is empty', () => {
    // Arrange
    component.form.controls.displacedNodePenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if displacedNodePenalty < 0', () => {
    // Arrange
    component.form.controls.displacedNodePenalty.setValue(-1);
    component.form.controls.displacedNodePenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if missingAttributeStrategy is empty', () => {
    // Arrange
    component.form.controls.missingAttributeStrategy.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if missingAttributePenalty is empty', () => {
    // Arrange
    component.form.controls.missingAttributePenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if missingAttributePenalty < 0', () => {
    // Arrange
    component.form.controls.missingAttributePenalty.setValue(-1);
    component.form.controls.missingAttributePenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if superfluousAttributeStrategy is empty', () => {
    // Arrange
    component.form.controls.superfluousAttributeStrategy.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if superfluousAttributePenalty is empty', () => {
    // Arrange
    component.form.controls.superfluousAttributePenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if superfluousAttributePenalty < 0', () => {
    // Arrange
    component.form.controls.superfluousAttributePenalty.setValue(-1);
    component.form.controls.superfluousAttributePenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if incorrectAttributeValueStrategy is empty', () => {
    // Arrange
    component.form.controls.incorrectAttributeValueStrategy.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if incorrectAttributeValuePenalty is empty', () => {
    // Arrange
    component.form.controls.incorrectAttributeValuePenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if incorrectAttributeValuePenalty < 0', () => {
    // Arrange
    component.form.controls.incorrectAttributeValuePenalty.setValue(-1);
    component.form.controls.incorrectAttributeValuePenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if incorrectTextStrategy is empty', () => {
    // Arrange
    component.form.controls.incorrectTextStrategy.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if incorrectTextPenalty is empty', () => {
    // Arrange
    component.form.controls.incorrectTextPenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if incorrectTextPenalty < 0', () => {
    // Arrange
    component.form.controls.incorrectTextPenalty.setValue(-1);
    component.form.controls.incorrectTextPenalty.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });
});
