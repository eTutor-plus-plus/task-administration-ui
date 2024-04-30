import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeRelalgComponent } from './task-type-relalg.component';

describe('TaskTypeRelalgComponent', () => {
  let component: TaskTypeRelalgComponent;
  let fixture: ComponentFixture<TaskTypeRelalgComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeRelalgComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskTypeRelalgComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
