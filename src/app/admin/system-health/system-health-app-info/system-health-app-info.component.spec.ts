import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';

import { SystemHealthAppInfoComponent } from './system-health-app-info.component';
import { API_URL } from '../../../app.config';
import { translocoTestConfig } from '../../../translation-loader.service.spec';

describe('SystemHealthAppInfoComponent', () => {
  let component: SystemHealthAppInfoComponent;
  let fixture: ComponentFixture<SystemHealthAppInfoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemHealthAppInfoComponent],
      providers: [
        provideHttpClient(),
        provideTransloco(translocoTestConfig),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(SystemHealthAppInfoComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
