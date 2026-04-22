/*
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { InputTextareaModule } from 'primeng/inputtextarea';

import { TaskGroupTypeOwlComponent } from './task-group-type-owl.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskGroupTypeOwlComponent', () => {
  let component: TaskGroupTypeOwlComponent;
  let fixture: ComponentFixture<TaskGroupTypeOwlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TaskGroupTypeOwlComponent,
        InputTextareaModule
      ],
      providers: [
        provideTransloco(translocoTestConfig)
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskGroupTypeOwlComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toHaveLength(1);
  });

  it('should show error if ontology is empty', () => {
    // Arrange
    component.form.controls.ontology.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.ontology.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#ontology + .p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if ontology is too short', () => {
    // Arrange
    component.form.patchValue({ontology: ''});
    component.form.controls.ontology.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.ontology.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#ontology + .p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should be valid with valid ontology', () => {
    // Arrange
    component.form.patchValue({ontology: 'valid ontology content'});
    component.form.controls.ontology.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.ontology.valid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#ontology + .p-error');
    expect(msg).toBeFalsy();
  });
});
*/
