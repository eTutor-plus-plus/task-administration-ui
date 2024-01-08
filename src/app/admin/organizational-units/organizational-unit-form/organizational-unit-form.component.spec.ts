import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OrganizationalUnitFormComponent } from './organizational-unit-form.component';

describe('OrganizationalUnitFormComponent', () => {
  let component: OrganizationalUnitFormComponent;
  let fixture: ComponentFixture<OrganizationalUnitFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OrganizationalUnitFormComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OrganizationalUnitFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
