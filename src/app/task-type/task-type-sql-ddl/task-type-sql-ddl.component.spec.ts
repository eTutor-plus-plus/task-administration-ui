import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeSqlDdlComponent } from './task-type-sql-ddl.component';

describe('TaskTypeSqlDdlComponent', () => {
  let component: TaskTypeSqlDdlComponent;
  let fixture: ComponentFixture<TaskTypeSqlDdlComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeSqlDdlComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskTypeSqlDdlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
