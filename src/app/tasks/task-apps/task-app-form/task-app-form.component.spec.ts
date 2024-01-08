import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskAppFormComponent } from './task-app-form.component';

describe('TaskAppFormComponent', () => {
  let component: TaskAppFormComponent;
  let fixture: ComponentFixture<TaskAppFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskAppFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskAppFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
