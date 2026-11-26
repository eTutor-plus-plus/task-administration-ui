import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskGroupTypeTriggerComponent } from './task-group-type-trigger.component';

describe('TaskGroupTypeTriggerComponent', () => {
  let component: TaskGroupTypeTriggerComponent;
  let fixture: ComponentFixture<TaskGroupTypeTriggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskGroupTypeTriggerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskGroupTypeTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
