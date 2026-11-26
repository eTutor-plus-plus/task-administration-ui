import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeUmlComponent } from './task-type-uml.component';

describe('TaskTypeUmlComponent', () => {
  let component: TaskTypeUmlComponent;
  let fixture: ComponentFixture<TaskTypeUmlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeUmlComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskTypeUmlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
