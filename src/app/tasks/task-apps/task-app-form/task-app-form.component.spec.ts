import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { TaskAppFormComponent } from './task-app-form.component';
import { translocoTestConfig } from '../../../translation-loader.service.spec';
import { API_URL } from '../../../app.config';

describe('TaskAppFormComponent', () => {
  let component: TaskAppFormComponent;
  let fixture: ComponentFixture<TaskAppFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskAppFormComponent],
      providers: [
        provideHttpClient(),
        provideTransloco(translocoTestConfig),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'},
        {provide: DynamicDialogRef, useValue: {close: jest.fn()}},
        {provide: DynamicDialogConfig, useValue: {data: {}}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskAppFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
