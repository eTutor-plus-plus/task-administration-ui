import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTransloco } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';

import { TaskGroupsComponent } from './task-groups.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';
import { API_URL } from '../../app.config';

describe('TaskGroupsComponent', () => {
  let component: TaskGroupsComponent;
  let fixture: ComponentFixture<TaskGroupsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskGroupsComponent],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        provideTransloco(translocoTestConfig),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskGroupsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
