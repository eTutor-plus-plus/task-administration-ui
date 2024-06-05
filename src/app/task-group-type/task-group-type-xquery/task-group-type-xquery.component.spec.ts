import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskGroupTypeXqueryComponent } from './task-group-type-xquery.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';
import { TaskGroupDto } from '../../api';
import { XqueryService } from './xquery.service';

describe('TaskGroupTypeXqueryComponent', () => {
  let component: TaskGroupTypeXqueryComponent;
  let fixture: ComponentFixture<TaskGroupTypeXqueryComponent>;

  const xqFn = jest.fn();

  beforeEach(async () => {
    xqFn.mockClear();

    await TestBed.configureTestingModule({
      imports: [
        TaskGroupTypeXqueryComponent,
        MonacoEditorModule.forRoot({})
      ],
      providers: [
        provideTransloco(translocoTestConfig),
        {provide: XqueryService, useValue: {loadDiagnoseDocument: xqFn}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskGroupTypeXqueryComponent);
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
    const expected = 'http://localhost/task-group-type-xq/1';
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
    xqFn.mockResolvedValue(expected);

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
    xqFn.mockRejectedValue('some error');

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

  it('should show error if diagnoseDocument is empty', () => {
    // Arrange
    component.form.controls.diagnoseDocument.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#diagnoseDocument + .p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if diagnoseDocument is too short', () => {
    // Arrange
    component.form.patchValue({diagnoseDocument: '123'});
    component.form.controls.diagnoseDocument.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#diagnoseDocument + .p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if submitDocument is empty', () => {
    // Arrange
    component.form.controls.submitDocument.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#submitDocument + .p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if submitDocument is too short', () => {
    // Arrange
    component.form.patchValue({submitDocument: '123'});
    component.form.controls.submitDocument.markAsDirty();

    // Act
    fixture.detectChanges();

    // Assert
    const elem: HTMLElement = fixture.nativeElement;
    const msg: HTMLElement | null = elem.querySelector('#submitDocument + .p-error');
    expect(msg).toBeTruthy();
  });
});
