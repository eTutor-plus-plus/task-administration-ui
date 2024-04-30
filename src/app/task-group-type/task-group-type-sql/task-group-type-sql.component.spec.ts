import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskGroupTypeSqlComponent } from './task-group-type-sql.component';

describe('TaskGroupTypeSqlComponent', () => {
  let component: TaskGroupTypeSqlComponent;
  let fixture: ComponentFixture<TaskGroupTypeSqlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskGroupTypeSqlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskGroupTypeSqlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
