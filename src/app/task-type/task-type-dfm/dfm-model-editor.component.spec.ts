import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTransloco } from '@ngneat/transloco';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { FormControl } from '@angular/forms';
import { MessageService } from 'primeng/api';

import { DfmModelEditorComponent } from './dfm-model-editor.component';
import { DfmGraphComponent } from './dfm-graph.component';
import { DfmGraph, DfmParseError } from './dfm-graph.model';
import { DfmService } from './dfm.service';
import { API_URL } from '../../app.config';
import { TranslationLoaderService } from '../../translation-loader.service';

describe('DfmModelEditorComponent', () => {
  let component: DfmModelEditorComponent;
  let fixture: ComponentFixture<DfmModelEditorComponent>;
  let control: FormControl<string | null>;
  let clipboardDescriptor: PropertyDescriptor | undefined;

  beforeEach(async () => {
    clipboardDescriptor = Object.getOwnPropertyDescriptor(navigator, 'clipboard');
    await TestBed.configureTestingModule({
      imports: [DfmModelEditorComponent],
      providers: [
        MessageService,
        provideHttpClient(),
        provideHttpClientTesting(),
        {provide: API_URL, useValue: 'http://localhost'},
        provideTransloco({
          config: {
            defaultLang: 'en',
            fallbackLang: 'en',
            availableLangs: ['en', 'de'],
            prodMode: false,
            missingHandler: {
              useFallbackTranslation: true,
              logMissingKey: false
            },
            flatten: {
              aot: false
            }
          },
          loader: TranslationLoaderService
        })
      ]
    })
    .overrideComponent(DfmModelEditorComponent, {set: {template: ''}})
    .compileComponents();

    fixture = TestBed.createComponent(DfmModelEditorComponent);
    component = fixture.componentInstance;
    control = new FormControl<string | null>('');
    component.control = control;
    component.inputId = 'solution';
    fixture.detectChanges();
  });

  afterEach(() => {
    if (clipboardDescriptor)
      Object.defineProperty(navigator, 'clipboard', clipboardDescriptor);
    else
      Reflect.deleteProperty(navigator, 'clipboard');
  });

  it('should automatically adjust the editor when its size changes', () => {
    expect(component.editorOptions.automaticLayout).toBe(true);
  });

  it('should use the labels of the model kind', () => {
    expect(component.keys.clear).toBe('taskTypes.dfm.fields.clearSolution');

    component.kind = 'submodel';

    expect(component.keys.clear).toBe('taskTypes.dfm.fields.clearSubmodel');
    expect(component.keys.check).toBe('taskTypes.dfm.fields.checkSubmodel');
  });

  it('should clear the model and mark it as changed', () => {
    control.setValue('fact Sales { amount };');
    control.markAsPristine();

    component.clear();

    expect(control.value).toBe('');
    expect(control.dirty).toBe(true);
  });

  it('should reset the preview when clearing the model', async () => {
    jest.spyOn(TestBed.inject(DfmService), 'parse').mockResolvedValue({nodes: [], edges: []});
    control.setValue('fact Sales { amount };');
    await component.check();

    component.clear();

    expect(component.preview.graph).toBeNull();
    expect(component.preview.source).toBeNull();
  });

  it('should copy the model to the clipboard', async () => {
    const writeText = jest.fn().mockResolvedValue(undefined);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText}
    });
    control.setValue('fact Sales { amount };');

    await component.copy();

    expect(writeText).toHaveBeenCalledWith('fact Sales { amount };');
  });

  it('should report clipboard errors', async () => {
    const error = new Error('Clipboard unavailable');
    const writeText = jest.fn().mockRejectedValue(error);
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {writeText}
    });
    const addMessage = jest.spyOn(TestBed.inject(MessageService), 'add');
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    await component.copy();

    expect(consoleError).toHaveBeenCalledWith('[DfmModelEditorComponent] Could not copy text to clipboard', error);
    expect(addMessage).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      key: 'global'
    }));
    consoleError.mockRestore();
  });

  it('should load the graph preview', async () => {
    const graph: DfmGraph = {
      nodes: [{id: 'f', label: 'Sales', type: 'FACT', optional: false, details: []}],
      edges: []
    };
    const parse = jest.spyOn(TestBed.inject(DfmService), 'parse').mockResolvedValue(graph);
    control.setValue('fact Sales { amount };');

    await component.check();

    expect(parse).toHaveBeenCalledWith('fact Sales { amount };');
    expect(component.preview.graph).toEqual(graph);
    expect(component.preview.source).toBe('fact Sales { amount };');
    expect(component.preview.error).toBeNull();
    expect(component.preview.loading).toBe(false);
  });

  it('should show parse errors in the preview', async () => {
    jest.spyOn(TestBed.inject(DfmService), 'parse').mockRejectedValue(new DfmParseError('Unexpected token', 2, 5));
    control.setValue('invalid');

    await component.check();

    expect(component.preview.graph).toBeNull();
    expect(component.preview.error).toEqual({message: 'Unexpected token', line: 2, column: 5});
  });

  it('should show a generic error if the preview is not available', async () => {
    jest.spyOn(TestBed.inject(DfmService), 'parse').mockRejectedValue(new Error('offline'));
    control.setValue('fact Sales { amount };');

    await component.check();

    expect(component.preview.graph).toBeNull();
    expect(component.preview.error?.message).toBeTruthy();
    expect(component.preview.error?.line).toBeNull();
  });

  it('should not request a preview for blank models', async () => {
    const parse = jest.spyOn(TestBed.inject(DfmService), 'parse');
    control.setValue('   ');

    await component.check();

    expect(parse).not.toHaveBeenCalled();
  });

  it('should hide the preview when dismissed', async () => {
    jest.spyOn(TestBed.inject(DfmService), 'parse').mockResolvedValue({nodes: [], edges: []});
    control.setValue('fact Sales { amount };');
    await component.check();

    component.dismiss();

    expect(component.preview.graph).toBeNull();
    expect(component.preview.source).toBeNull();
    expect(component.preview.error).toBeNull();
    expect(control.value).toBe('fact Sales { amount };');
  });

  it('should report PNG download errors', async () => {
    const error = new Error('Canvas unavailable');
    const graphComponent = new DfmGraphComponent();
    jest.spyOn(graphComponent, 'downloadPng').mockRejectedValue(error);
    const addMessage = jest.spyOn(TestBed.inject(MessageService), 'add');
    const consoleError = jest.spyOn(console, 'error').mockImplementation();

    await component.download(graphComponent);

    expect(consoleError).toHaveBeenCalledWith(
      '[DfmModelEditorComponent] Could not download DFM preview as PNG',
      error
    );
    expect(addMessage).toHaveBeenCalledWith(expect.objectContaining({
      severity: 'error',
      key: 'global'
    }));
    consoleError.mockRestore();
  });
});
