import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskTypeClusteringComponent } from './task-type-clustering.component';
import { ReactiveFormsModule, UntypedFormGroup } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { provideTransloco } from '@ngneat/transloco';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { MessageService } from 'primeng/api';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';
import { API_URL } from '../../app.config';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('TaskTypeClusteringComponent', () => {
  let component: TaskTypeClusteringComponent;
  let fixture: ComponentFixture<TaskTypeClusteringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TaskTypeClusteringComponent, MonacoEditorModule.forRoot({}),
        ReactiveFormsModule,
        DropdownModule,
        InputNumberModule
      ],
      providers: [
        provideTransloco(translocoTestConfig),
        provideHttpClient(),
        provideRouter([]),
        MessageService,
        {provide: API_URL, useValue: 'http://localhost'}
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTypeClusteringComponent);
    component = fixture.componentInstance;
    component.formGroup = new UntypedFormGroup({});
    fixture.detectChanges();
  });

  it('should create the component', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with default values', () => {
    expect(component.form.get('numberOfClusters')?.value).toBe(2);
    expect(component.form.get('distanceMetric')?.value).toBe('EUCLIDEAN');
    expect(component.form.get('taskLength')?.value).toBe('SHORT');
  });

  it('should patch form values on originalData change', () => {
    const data = {
      numberOfClusters: 2,
      distanceMetric: 'EUCLIDEAN',
      taskLength: 'SHORT'
    };

    component.testSetOriginalData(data);

    expect(component.form.value).toEqual(expect.objectContaining(data));
  });
});
