import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeHierarchicalClusteringComponent } from './task-type-hierarchical-clustering.component';

describe('TaskTypeHierarchicalClusteringComponent', () => {
  let component: TaskTypeHierarchicalClusteringComponent;
  let fixture: ComponentFixture<TaskTypeHierarchicalClusteringComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeHierarchicalClusteringComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskTypeHierarchicalClusteringComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
