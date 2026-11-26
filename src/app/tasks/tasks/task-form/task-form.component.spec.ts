import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';
import { FormArray, FormGroup } from '@angular/forms';

import { TaskFormComponent } from './task-form.component';
import { translocoTestConfig } from '../../../translation-loader.service.spec';
import { API_URL } from '../../../app.config';

describe('TaskFormComponent', () => {
  let component: TaskFormComponent;
  let fixture: ComponentFixture<TaskFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskFormComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTransloco(translocoTestConfig),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

// The form logic is tested without rendering the component, as the rich text editor cannot be created in the test DOM.
describe('TaskFormComponent task categories', () => {
  it('should add a task category row with default feedback levels', () => {
    const ctx = {form: new FormGroup({taskCategoryIds: new FormArray<FormGroup>([])})};

    TaskFormComponent.prototype.addTaskCategory.call(ctx);

    expect(ctx.form.controls.taskCategoryIds.at(0).value).toEqual({category: null, submitFeedbackLevel: 0, diagnoseFeedbackLevel: 0});
  });

  it('should send task category ids and feedback levels', () => {
    const result = TaskFormComponent.prototype.modifyValueBeforeSend.call({}, {
      title: 'Test',
      taskCategoryIds: [
        {category: {data: 4}, submitFeedbackLevel: 1, diagnoseFeedbackLevel: 3},
        {category: null, submitFeedbackLevel: 2, diagnoseFeedbackLevel: 2},
        {category: {data: 7}, submitFeedbackLevel: null, diagnoseFeedbackLevel: 2}
      ]
    }, 'update');

    expect(result.taskCategoryIds).toEqual([4, 7]);
    expect(result.taskCategoryFeedbackLevels).toEqual([
      {taskCategoryId: 4, submitFeedbackLevel: 1, diagnoseFeedbackLevel: 3},
      {taskCategoryId: 7, submitFeedbackLevel: 0, diagnoseFeedbackLevel: 2}
    ]);
  });
});
