import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskGroupTypeFormComponent } from './task-group-type-form.component';

describe('TaskGroupTypeFormComponent', () => {
  let component: TaskGroupTypeFormComponent<any>;
  let fixture: ComponentFixture<TaskGroupTypeFormComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskGroupTypeFormComponent]
    })
    .compileComponents();

    // fixture = TestBed.createComponent(TaskTypeFormComponent);
    // component = fixture.componentInstance;
    // fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
