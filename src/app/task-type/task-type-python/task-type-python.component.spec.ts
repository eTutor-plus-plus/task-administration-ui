import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypePythonComponent } from './task-type-python.component';

describe('TaskTypePythonComponent', () => {
  let component: TaskTypePythonComponent;
  let fixture: ComponentFixture<TaskTypePythonComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypePythonComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskTypePythonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
