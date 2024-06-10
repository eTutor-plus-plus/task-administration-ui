import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';

import { SystemHealthMetricsComponent } from './system-health-metrics.component';
import { translocoTestConfig } from '../../../translation-loader.service.spec';
import { API_URL } from '../../../app.config';

describe('SystemHealthMetricsComponent', () => {
  let component: SystemHealthMetricsComponent;
  let fixture: ComponentFixture<SystemHealthMetricsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemHealthMetricsComponent],
      providers: [
        provideHttpClient(),
        provideTransloco(translocoTestConfig),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SystemHealthMetricsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
