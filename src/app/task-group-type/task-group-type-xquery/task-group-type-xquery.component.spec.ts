import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskGroupTypeXqueryComponent } from './task-group-type-xquery.component';

describe('TaskGroupTypeXqueryComponent', () => {
  let component: TaskGroupTypeXqueryComponent;
  let fixture: ComponentFixture<TaskGroupTypeXqueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskGroupTypeXqueryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskGroupTypeXqueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
