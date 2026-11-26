import { ComponentFixture, TestBed } from '@angular/core/testing';

import { provideTransloco } from '@ngneat/transloco';
import { MonacoEditorModule } from 'ngx-monaco-editor-v2';

import { DkeEditorComponent } from './dke-editor.component';
import { translocoTestConfig } from '../../translation-loader.service.spec';

describe('EditorComponent', () => {
  let component: DkeEditorComponent;
  let fixture: ComponentFixture<DkeEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DkeEditorComponent, MonacoEditorModule.forRoot({})],
      providers: [provideTransloco(translocoTestConfig)]
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
