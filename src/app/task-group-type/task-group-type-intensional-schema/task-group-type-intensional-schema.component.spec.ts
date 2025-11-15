import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskGroupTypeIntensionalSchemaComponent } from './task-group-type-intensional-schema.component';

describe('TaskGroupTypeIntensionalSchemaComponent', () => {
  let component: TaskGroupTypeIntensionalSchemaComponent;
  let fixture: ComponentFixture<TaskGroupTypeIntensionalSchemaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskGroupTypeIntensionalSchemaComponent]
    })
      .compileComponents();

    fixture = TestBed.createComponent(TaskGroupTypeIntensionalSchemaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
