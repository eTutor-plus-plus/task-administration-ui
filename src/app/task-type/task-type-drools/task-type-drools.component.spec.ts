import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeDroolsComponent } from './task-type-drools.component';

describe('TaskTypeDroolsComponent', () => {
  let component: TaskTypeDroolsComponent;
  let fixture: ComponentFixture<TaskTypeDroolsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeDroolsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(TaskTypeDroolsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
