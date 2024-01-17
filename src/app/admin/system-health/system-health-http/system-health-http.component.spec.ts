import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemHealthHttpComponent } from './system-health-http.component';

describe('SystemHealthHttpComponent', () => {
  let component: SystemHealthHttpComponent;
  let fixture: ComponentFixture<SystemHealthHttpComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemHealthHttpComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SystemHealthHttpComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
