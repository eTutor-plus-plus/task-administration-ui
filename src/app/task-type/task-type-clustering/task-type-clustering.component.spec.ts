import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TaskTypeClusteringComponent } from './task-type-clustering.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';

describe('TaskTypeClusteringComponent', () => {
  let component: TaskTypeClusteringComponent;
  let fixture: ComponentFixture<TaskTypeClusteringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TaskTypeClusteringComponent,
        ReactiveFormsModule,
        DropdownModule,
        InputNumberModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TaskTypeClusteringComponent);
    component = fixture.componentInstance;
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

    expect(component.form.value).toEqual(data);
  });
});
