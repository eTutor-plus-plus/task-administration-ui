import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeTriggerComponent } from './task-type-trigger.component';

describe('TaskTypeTriggerComponent', () => {
  let component: TaskTypeTriggerComponent;
  let fixture: ComponentFixture<TaskTypeTriggerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeTriggerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskTypeTriggerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
