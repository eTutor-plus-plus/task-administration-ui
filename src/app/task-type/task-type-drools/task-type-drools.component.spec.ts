import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeDroolsComponent } from './task-type-drools.component';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { API_URL } from '../../app.config';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskTypeDroolsComponent', () => {
  let component: TaskTypeDroolsComponent;
  let fixture: ComponentFixture<TaskTypeDroolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeDroolsComponent, MonacoEditorModule.forRoot({})],
      providers: [
        provideTransloco(translocoTestConfig),
        provideHttpClient(),
        provideRouter([]),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'}
      ]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskTypeDroolsComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
