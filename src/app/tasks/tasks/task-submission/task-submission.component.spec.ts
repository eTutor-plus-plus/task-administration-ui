import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskSubmissionComponent } from './task-submission.component';

describe('TaskSubmissionComponent', () => {
  let component: TaskSubmissionComponent;
  let fixture: ComponentFixture<TaskSubmissionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskSubmissionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskSubmissionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
