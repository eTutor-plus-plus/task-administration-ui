import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskGroupTypeOrViewComponent } from './task-group-type-or-view.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskGroupTypeOrViewComponent', () => {
  let component: TaskGroupTypeOrViewComponent;
  let fixture: ComponentFixture<TaskGroupTypeOrViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TaskGroupTypeOrViewComponent,
        MonacoEditorModule.forRoot({})
      ],
      providers: [provideTransloco(translocoTestConfig)]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskGroupTypeOrViewComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    expect(Object.keys(component.form.controls)).toHaveLength(4);
  });

  // Extensional Schema

  it('should show error if extensionalSchema is empty', () => {
    component.form.controls.extensionalSchema.markAsDirty();
    fixture.detectChanges();

    expect(component.form.controls.extensionalSchema.invalid).toBe(true);

    const elem: HTMLElement = fixture.nativeElement;
    const msg = elem.querySelector('#extensionalSchema + .p-error');
    expect(msg).toBeTruthy();
  });

  it('should show error if extensionalSchema is too short', () => {
    component.form.patchValue({ extensionalSchema: '123' });
    component.form.controls.extensionalSchema.markAsDirty();
    fixture.detectChanges();

    expect(component.form.controls.extensionalSchema.invalid).toBe(true);
  });

  // Intensional Schema

  it('should show error if intensionalSchema is empty', () => {
    component.form.controls.intensionalSchema.markAsDirty();
    fixture.detectChanges();

    expect(component.form.controls.intensionalSchema.invalid).toBe(true);
  });

  it('should show error if intensionalSchema is too short', () => {
    component.form.patchValue({ intensionalSchema: '123' });
    component.form.controls.intensionalSchema.markAsDirty();
    fixture.detectChanges();

    expect(component.form.controls.intensionalSchema.invalid).toBe(true);
  });

  // Diagnose Inserts

  it('should show error if diagnoseInserts is empty', () => {
    component.form.controls.diagnoseInserts.markAsDirty();
    fixture.detectChanges();

    expect(component.form.controls.diagnoseInserts.invalid).toBe(true);
  });

  it('should show error if diagnoseInserts is too short', () => {
    component.form.patchValue({ diagnoseInserts: '123' });
    component.form.controls.diagnoseInserts.markAsDirty();
    fixture.detectChanges();

    expect(component.form.controls.diagnoseInserts.invalid).toBe(true);
  });

  // Submit Inserts

  it('should show error if submitInserts is empty', () => {
    component.form.controls.submitInserts.markAsDirty();
    fixture.detectChanges();

    expect(component.form.controls.submitInserts.invalid).toBe(true);
  });

  it('should show error if submitInserts is too short', () => {
    component.form.patchValue({ submitInserts: '123' });
    component.form.controls.submitInserts.markAsDirty();
    fixture.detectChanges();

    expect(component.form.controls.submitInserts.invalid).toBe(true);
  });
});
