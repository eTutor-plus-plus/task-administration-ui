import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskTypeAspComponent } from './task-type-asp.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskTypeAspComponent', () => {
  let component: TaskTypeAspComponent;
  let fixture: ComponentFixture<TaskTypeAspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeAspComponent, MonacoEditorModule.forRoot({})],
      providers: [provideTransloco(translocoTestConfig)]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTypeAspComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toHaveLength(2);
  });

  it('should show error if solution is empty', () => {
    // Arrange
    component.form.controls.solution.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.solution.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if maxN < 1', () => {
    // Arrange
    component.form.patchValue({maxN: 0});
    component.form.controls.solution.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.maxN.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });
});
