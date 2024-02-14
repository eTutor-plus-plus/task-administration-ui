import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SystemHealthEnvComponent } from './system-health-env.component';

describe('SystemHealthConfigurationComponent', () => {
  let component: SystemHealthEnvComponent;
  let fixture: ComponentFixture<SystemHealthEnvComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SystemHealthEnvComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SystemHealthEnvComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
