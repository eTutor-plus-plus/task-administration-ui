import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemHealthFlywayComponent } from './system-health-flyway.component';

describe('SystemHealthFlywayComponent', () => {
  let component: SystemHealthFlywayComponent;
  let fixture: ComponentFixture<SystemHealthFlywayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemHealthFlywayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SystemHealthFlywayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
