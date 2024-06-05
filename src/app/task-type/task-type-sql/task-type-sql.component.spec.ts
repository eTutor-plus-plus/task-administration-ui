import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeSqlComponent } from './task-type-sql.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskTypeSqlComponent', () => {
  let component: TaskTypeSqlComponent;
  let fixture: ComponentFixture<TaskTypeSqlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeSqlComponent, MonacoEditorModule.forRoot({})],
      providers: [provideTransloco(translocoTestConfig)]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTypeSqlComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toHaveLength(3);
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
