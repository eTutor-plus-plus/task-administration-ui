import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeSqlComponent } from './task-type-sql.component';

describe('TaskTypeSqlComponent', () => {
  let component: TaskTypeSqlComponent;
  let fixture: ComponentFixture<TaskTypeSqlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeSqlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskTypeSqlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
