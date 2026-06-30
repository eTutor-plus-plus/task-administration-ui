import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { CheckboxModule } from 'primeng/checkbox';

import { TaskTypeOrViewsComponent } from './task-type-or-view.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskTypeOrViewsComponent', () => {
  let component: TaskTypeOrViewsComponent;
  let fixture: ComponentFixture<TaskTypeOrViewsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TaskTypeOrViewsComponent,
        MonacoEditorModule.forRoot({}),
        CheckboxModule
      ],
      providers: [provideTransloco(translocoTestConfig)]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTypeOrViewsComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should show error if solution is empty', () => {
    component.form.controls['solution'].markAsDirty();
    fixture.detectChanges();

    expect(component.form.controls['solution'].invalid).toBe(true);
    expect(component.form.controls['solution'].errors?.['required']).toBeTruthy();
  });

  it('should show error if testQuery is empty', () => {
    component.form.controls['testQuery'].markAsDirty();
    fixture.detectChanges();

    expect(component.form.controls['testQuery'].invalid).toBe(true);
    expect(component.form.controls['testQuery'].errors?.['required']).toBeTruthy();
  });

  it('should require underSuperview when hasUnderSuperview is checked', () => {
    component.form.controls['hasUnderSuperview'].setValue(true);
    fixture.detectChanges();

    expect(component.form.controls['underSuperview'].validator).toBeTruthy();
  });

  it('should clear underSuperview when hasUnderSuperview is unchecked', () => {
    component.form.controls['hasUnderSuperview'].setValue(true);
    component.form.controls['underSuperview'].setValue('some ddl');
    component.form.controls['hasUnderSuperview'].setValue(false);
    fixture.detectChanges();

    expect(component.form.controls['underSuperview'].value).toBeNull();
    expect(component.form.controls['underSuperview'].validator).toBeNull();
  });

  it('should require refSuperview when hasRefSuperview is checked', () => {
    component.form.controls['hasRefSuperview'].setValue(true);
    fixture.detectChanges();

    expect(component.form.controls['refSuperview'].validator).toBeTruthy();
  });

  it('should clear refSuperview when hasRefSuperview is unchecked', () => {
    component.form.controls['hasRefSuperview'].setValue(true);
    component.form.controls['refSuperview'].setValue('some ddl');
    component.form.controls['hasRefSuperview'].setValue(false);
    fixture.detectChanges();

    expect(component.form.controls['refSuperview'].value).toBeNull();
    expect(component.form.controls['refSuperview'].validator).toBeNull();
  });
});
