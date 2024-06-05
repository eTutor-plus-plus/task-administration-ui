import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';

import { TaskGroupTypeBinarySearchComponent } from './task-group-type-binary-search.component';
import { BinarySearchService } from './binary-search.service';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskGroupTypeBinarySearchComponent', () => {
  let component: TaskGroupTypeBinarySearchComponent;
  let fixture: ComponentFixture<TaskGroupTypeBinarySearchComponent>;

  const randomFn = jest.fn();

  beforeEach(async () => {
    randomFn.mockClear();
    randomFn.mockResolvedValue({min: 1, max: 10});

    await TestBed.configureTestingModule({
      imports: [TaskGroupTypeBinarySearchComponent],
      providers: [
        provideTransloco(translocoTestConfig),
        {provide: BinarySearchService, useValue: {loadNewRandomNumbers: randomFn}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskGroupTypeBinarySearchComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toHaveLength(2);
  });

  it('should load numbers', async () => {
    // Act
    await component.loadNumbers();

    // Assert
    expect(component.form.value.minNumber).toBe(1);
    expect(component.form.value.maxNumber).toBe(10);
    expect(component.loading).toBe(false);
  });

  it('should not fail on failed number loading', async () => {
    // Act
    randomFn.mockRejectedValueOnce('some error');

    // Act
    await component.loadNumbers();

    // Assert
    expect(component.form.value.minNumber).toBeNull();
    expect(component.form.value.minNumber).toBeNull();
    expect(component.loading).toBe(false);
  });

  it('should show error if minNumber is empty', () => {
    // Arrange
    component.form.controls.minNumber.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if maxNumber is empty', () => {
    // Arrange
    component.form.controls.maxNumber.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if maxNumber < minNumber', () => {
    // Arrange
    component.form.patchValue({minNumber: 100, maxNumber: 99});
    component.form.controls.maxNumber.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('.p-error');
    expect(msg).toBeTruthy();
  });
});
