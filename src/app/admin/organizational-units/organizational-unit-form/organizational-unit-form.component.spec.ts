import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideTransloco } from '@ngneat/transloco';
import { MessageService } from 'primeng/api';
import { DynamicDialogConfig, DynamicDialogRef } from 'primeng/dynamicdialog';

import { OrganizationalUnitFormComponent } from './organizational-unit-form.component';
import { API_URL } from '../../../app.config';
import { translocoTestConfig } from '../../../translation-loader.service.spec';

describe('OrganizationalUnitFormComponent', () => {
  let component: OrganizationalUnitFormComponent;
  let fixture: ComponentFixture<OrganizationalUnitFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationalUnitFormComponent],
      providers: [
        provideHttpClient(),
        provideTransloco(translocoTestConfig),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'},
        {provide: DynamicDialogRef, useValue: {close: jest.fn()}},
        {provide: DynamicDialogConfig, useValue: {data:{}}}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(OrganizationalUnitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
