import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeFormComponent } from './task-type-form.component';

describe('TaskTypeFormComponent', () => {
  let component: TaskTypeFormComponent<any>;
  let fixture: ComponentFixture<TaskTypeFormComponent<any>>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeFormComponent]
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
