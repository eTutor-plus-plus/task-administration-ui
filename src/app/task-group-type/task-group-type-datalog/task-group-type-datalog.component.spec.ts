import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { provideTransloco } from '@ngneat/transloco';
import { UntypedFormGroup } from '@angular/forms';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskGroupTypeDatalogComponent } from './task-group-type-datalog.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';
import { DatalogService } from './datalog.service';
import { TaskGroupDto } from '../../api';

describe('TaskGroupTypeDatalogComponent', () => {
  let component: TaskGroupTypeDatalogComponent;
  let fixture: ComponentFixture<TaskGroupTypeDatalogComponent>;

  const dlgFn = jest.fn();

  beforeEach(async () => {
    dlgFn.mockClear();

    await TestBed.configureTestingModule({
      imports: [
        TaskGroupTypeDatalogComponent,
        MonacoEditorModule.forRoot({})
      ],
      providers: [
        provideTransloco(translocoTestConfig),
        {provide: DatalogService, useValue: {loadDiagnoseFacts: dlgFn}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskGroupTypeDatalogComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toHaveLength(2);
  });

  it('should set public url on task group change', fakeAsync(() => {
    // Arrange
    const expected = 'http://localhost/task-group-type-datalog/1';
    const tg: TaskGroupDto = {
      id: 1,
      name: '',
      descriptionDe: '',
      descriptionEn: '',
      taskGroupType: 'sql',
      status: 'APPROVED',
      organizationalUnitId: 1,
      createdBy: null,
      createdDate: null,
      lastModifiedBy: null,
      lastModifiedDate: null
    };
    dlgFn.mockResolvedValue(expected);

    // Act
    component.taskGroup = tg;
    tick();
    fixture.detectChanges();

    // Assert
    expect(component.publicUrl).toBe(expected);

    const elem: HTMLElement = fixture.nativeElement;
    const smallElem: HTMLElement | null = elem.querySelector('small.p-text-secondary');
    expect(smallElem).toBeTruthy();
    expect(smallElem?.innerText).toContain(expected);
  }));

  it('should set public url to undefined on load error', fakeAsync(() => {
    // Arrange
    const tg: TaskGroupDto = {
      id: 1,
      name: '',
      descriptionDe: '',
      descriptionEn: '',
      taskGroupType: 'sql',
      status: 'APPROVED',
      organizationalUnitId: 1,
      createdBy: null,
      createdDate: null,
      lastModifiedBy: null,
      lastModifiedDate: null
    };
    dlgFn.mockRejectedValue('some error');

    // Act
    component.taskGroup = tg;
    tick();
    fixture.detectChanges();

    // Assert
    expect(component.publicUrl).toBeUndefined();

    const elem: HTMLElement = fixture.nativeElement;
    const smallElem: HTMLElement | null = elem.querySelector('small.p-text-secondary');
    expect(smallElem).toBeFalsy();
  }));

  it('should set public url to undefined on undefined task group', fakeAsync(() => {
    // Act
    component.taskGroup = undefined;
    fixture.detectChanges();

    // Assert
    expect(component.publicUrl).toBeUndefined();

    const elem: HTMLElement = fixture.nativeElement;
    const smallElem: HTMLElement | null = elem.querySelector('small.p-text-secondary');
    expect(smallElem).toBeFalsy();
  }));

  it('should show error if diagnoseFacts is empty', () => {
    // Arrange
    component.form.controls.diagnoseFacts.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.diagnoseFacts.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#diagnoseFacts + .p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if diagnoseFacts is too short', () => {
    // Arrange
    component.form.patchValue({diagnoseFacts: '123'});
    component.form.controls.diagnoseFacts.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.diagnoseFacts.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#diagnoseFacts + .p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if submissionFacts is empty', () => {
    // Arrange
    component.form.controls.submissionFacts.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.submissionFacts.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#submissionFacts + .p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });

  it('should show error if submissionFacts is too short', () => {
    // Arrange
    component.form.patchValue({submissionFacts: '123'});
    component.form.controls.submissionFacts.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    expect(component.form.controls.submissionFacts.invalid).toBe(true);
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#submissionFacts + .p-error');
    expect(msg).toBeTruthy();
    expect(msg?.innerText.trim()).not.toHaveLength(0);
  });
});
