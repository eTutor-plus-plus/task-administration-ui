import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';

import { TaskAppsComponent } from './task-apps.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';
import { API_URL } from '../../app.config';

describe('TaskAppsComponent', () => {
  let component: TaskAppsComponent;
  let fixture: ComponentFixture<TaskAppsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskAppsComponent],
      providers: [
        provideHttpClient(),
        provideTransloco(translocoTestConfig),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskAppsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
