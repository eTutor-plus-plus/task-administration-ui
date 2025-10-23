import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskGroupTypeMdxComponent } from './task-group-type-mdx.component';

describe('TaskGroupTypeMdxComponent', () => {
  let component: TaskGroupTypeMdxComponent;
  let fixture: ComponentFixture<TaskGroupTypeMdxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskGroupTypeMdxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskGroupTypeMdxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
