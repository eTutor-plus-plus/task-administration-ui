import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';

import { TaskGroupTypeJDBCComponent } from './task-group-type-jdbc.component';
import { JDBCService } from './jdbc.service';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskGroupTypeJDBCComponent', () => {
  // let component: TaskGroupTypeJDBCComponent;
  // let fixture: ComponentFixture<TaskGroupTypeJDBCComponent>;

  // const randomFn = jest.fn();

  // beforeEach(async () => {
  //   randomFn.mockClear();
  //   randomFn.mockResolvedValue({min: 1, max: 10});

  //   await TestBed.configureTestingModule({
  //     imports: [TaskGroupTypeJDBCComponent],
  //     providers: [
  //       provideTransloco(translocoTestConfig),
  //       {provide: JDBCService, useValue: {loadNewRandomNumbers: randomFn}}
  //     ]
  //   }).compileComponents();

  //   fixture = TestBed.createComponent(TaskGroupTypeJDBCComponent);
  //   component = fixture.componentInstance;
  //   component.formGroup = new UntypedFormGroup({});
  //   fixture.detectChanges();
  // });

  // it('should create', () => {
  //   expect(component).toBeTruthy();
  //   expect(Object.keys(component.form.controls)).toHaveLength(2);
  // });

  // it('should load numbers', async () => {
  //   // Act
  //   await component.loadNumbers();

  //   // Assert
  //   expect(component.form.value.minNumber).toBe(1);
  //   expect(component.form.value.maxNumber).toBe(10);
  //   expect(component.loading).toBe(false);
  // });

  // it('should not fail on failed number loading', async () => {
  //   // Act
  //   randomFn.mockRejectedValueOnce('some error');

  //   // Act
  //   await component.loadNumbers();

  //   // Assert
  //   expect(component.form.value.minNumber).toBeNull();
  //   expect(component.form.value.minNumber).toBeNull();
  //   expect(component.loading).toBe(false);
  // });

  // it('should show error if minNumber is empty', () => {
  //   // Arrange
  //   component.form.controls.minNumber.markAsDirty();

  //   // Act
  //   fixture.detectChanges();

  //   // Assert
  //   expect(component.form.controls.minNumber.invalid).toBe(true);
  //   const elem: HTMLElement = fixture.nativeElement;
  //   const msg: HTMLElement | null = elem.querySelector('.p-error');
  //   expect(msg).toBeTruthy();
  //   expect(msg?.innerText.trim()).not.toHaveLength(0);
  // });

  // it('should show error if maxNumber is empty', () => {
  //   // Arrange
  //   component.form.controls.maxNumber.markAsDirty();

  //   // Act
  //   fixture.detectChanges();

  //   // Assert
  //   expect(component.form.controls.maxNumber.invalid).toBe(true);
  //   const elem: HTMLElement = fixture.nativeElement;
  //   const msg: HTMLElement | null = elem.querySelector('.p-error');
  //   expect(msg).toBeTruthy();
  //   expect(msg?.innerText.trim()).not.toHaveLength(0);
  // });

  // it('should show error if maxNumber < minNumber', () => {
  //   // Arrange
  //   component.form.patchValue({minNumber: 100, maxNumber: 99});
  //   component.form.controls.maxNumber.markAsDirty();

  //   // Act
  //   fixture.detectChanges();

  //   // Assert
  //   expect(component.form.invalid).toBe(true);
  //   const elem: HTMLElement = fixture.nativeElement;
  //   const msg: HTMLElement | null = elem.querySelector('.p-error');
  //   expect(msg).toBeTruthy();
  //   expect(msg?.innerText.trim()).not.toHaveLength(0);
  // });
});
