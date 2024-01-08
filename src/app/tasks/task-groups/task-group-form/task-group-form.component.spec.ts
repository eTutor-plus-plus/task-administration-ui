import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskGroupFormComponent } from './task-group-form.component';

describe('TaskGroupFormComponent', () => {
  let component: TaskGroupFormComponent;
  let fixture: ComponentFixture<TaskGroupFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskGroupFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskGroupFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
