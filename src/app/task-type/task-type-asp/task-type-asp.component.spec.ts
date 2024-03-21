import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeAspComponent } from './task-type-asp.component';

describe('TaskTypeAspComponent', () => {
  let component: TaskTypeAspComponent;
  let fixture: ComponentFixture<TaskTypeAspComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeAspComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskTypeAspComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
