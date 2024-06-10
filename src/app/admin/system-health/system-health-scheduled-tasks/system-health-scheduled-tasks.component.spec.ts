import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';

import { SystemHealthScheduledTasksComponent } from './system-health-scheduled-tasks.component';
import { translocoTestConfig } from '../../../translation-loader.service.spec';
import { API_URL } from '../../../app.config';

describe('SystemHealthScheduledTasksComponent', () => {
  let component: SystemHealthScheduledTasksComponent;
  let fixture: ComponentFixture<SystemHealthScheduledTasksComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemHealthScheduledTasksComponent],
      providers: [
        provideHttpClient(),
        provideTransloco(translocoTestConfig),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SystemHealthScheduledTasksComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
