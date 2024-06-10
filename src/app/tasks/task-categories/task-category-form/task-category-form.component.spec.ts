import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { TaskCategoryFormComponent } from './task-category-form.component';
import { translocoTestConfig } from '../../../translation-loader.service.spec';
import { API_URL } from '../../../app.config';

describe('TaskCategoryFormComponent', () => {
  let component: TaskCategoryFormComponent;
  let fixture: ComponentFixture<TaskCategoryFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskCategoryFormComponent],
      providers: [
        provideHttpClient(),
        provideTransloco(translocoTestConfig),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'},
        {provide: DynamicDialogRef, useValue: {close: jest.fn()}},
        {provide: DynamicDialogConfig, useValue: {data: {}}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskCategoryFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
