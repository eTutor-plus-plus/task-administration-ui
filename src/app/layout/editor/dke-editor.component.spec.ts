import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DkeEditorComponent } from './dke-editor.component';

describe('EditorComponent', () => {
  let component: DkeEditorComponent;
  let fixture: ComponentFixture<DkeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DkeEditorComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DkeEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
