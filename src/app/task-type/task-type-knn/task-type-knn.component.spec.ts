import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeKnnComponent } from './task-type-knn.component';
import { UntypedFormGroup } from '@angular/forms';
import { provideTransloco } from '@ngneat/transloco';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { API_URL } from '../../app.config';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskTypeKnnComponent', () => {
  let component: TaskTypeKnnComponent;
  let fixture: ComponentFixture<TaskTypeKnnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeKnnComponent, MonacoEditorModule.forRoot({})],
      providers: [
        provideTransloco(translocoTestConfig),
        provideHttpClient(),
        provideRouter([]),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'}
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskTypeKnnComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
