import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';

import { SystemHealthEnvComponent } from './system-health-env.component';
import { translocoTestConfig } from '../../../translation-loader.service.spec';
import { API_URL } from '../../../app.config';

describe('SystemHealthConfigurationComponent', () => {
  let component: SystemHealthEnvComponent;
  let fixture: ComponentFixture<SystemHealthEnvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemHealthEnvComponent],
      providers: [
        provideHttpClient(),
        provideTransloco(translocoTestConfig),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SystemHealthEnvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
