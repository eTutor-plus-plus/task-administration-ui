import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TaskTypeMdxComponent } from './task-type-mdx.component';

describe('TaskTypeMdxComponent', () => {
  let component: TaskTypeMdxComponent;
  let fixture: ComponentFixture<TaskTypeMdxComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TaskTypeMdxComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TaskTypeMdxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
