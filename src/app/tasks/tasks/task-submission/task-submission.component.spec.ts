import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { TaskSubmissionComponent } from './task-submission.component';
import { translocoTestConfig } from '../../../translation-loader.service.spec';
import { API_URL } from '../../../app.config';

describe('TaskSubmissionComponent', () => {
  let component: TaskSubmissionComponent;
  let fixture: ComponentFixture<TaskSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskSubmissionComponent, MonacoEditorModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideTransloco(translocoTestConfig),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'},
        {provide: DynamicDialogRef, useValue: {close: jest.fn()}},
        {provide: DynamicDialogConfig, useValue: {data: {}}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
