import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';

import { TaskGroupTypeOwlComponent } from './task-group-type-owl.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskGroupTypeOwlComponent', () => {
  let component: TaskGroupTypeOwlComponent;
  let fixture: ComponentFixture<TaskGroupTypeOwlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskGroupTypeOwlComponent],
      providers: [provideTransloco(translocoTestConfig)]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskGroupTypeOwlComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
    // the OWL task group type currently has no additional fields
    expect(Object.keys(component.form.controls)).toHaveLength(0);
  });
});
