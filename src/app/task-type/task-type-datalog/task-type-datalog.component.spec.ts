import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeDatalogComponent } from './task-type-datalog.component';

describe('TaskTypeDatalogComponent', () => {
  let component: TaskTypeDatalogComponent;
  let fixture: ComponentFixture<TaskTypeDatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeDatalogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskTypeDatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
