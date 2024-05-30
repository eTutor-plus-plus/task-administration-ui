import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslocoTestingModule } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';

import { ResetPasswordComponent } from './reset-password.component';
import { API_URL } from '../../app.config';
import { provideRouter } from '@angular/router';

describe('ResetPasswordComponent', () => {
  let component: ResetPasswordComponent;
  let fixture: ComponentFixture<ResetPasswordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        ResetPasswordComponent,
        TranslocoTestingModule.forRoot({}),
        HttpClientTestingModule
      ],
      providers: [
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'},
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ResetPasswordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
