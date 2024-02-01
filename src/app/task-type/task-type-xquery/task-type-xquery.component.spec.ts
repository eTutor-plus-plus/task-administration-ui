import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeXqueryComponent } from './task-type-xquery.component';

describe('TaskTypeXqueryComponent', () => {
  let component: TaskTypeXqueryComponent;
  let fixture: ComponentFixture<TaskTypeXqueryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeXqueryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskTypeXqueryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
