import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskGroupTypeDatalogComponent } from './task-group-type-datalog.component';

describe('TaskGroupTypeDatalogComponent', () => {
  let component: TaskGroupTypeDatalogComponent;
  let fixture: ComponentFixture<TaskGroupTypeDatalogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskGroupTypeDatalogComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskGroupTypeDatalogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
