import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeKnnComponent } from './task-type-knn.component';

describe('TaskTypeKnnComponent', () => {
  let component: TaskTypeKnnComponent;
  let fixture: ComponentFixture<TaskTypeKnnComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeKnnComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskTypeKnnComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
