import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTransloco } from '@ngneat/transloco';

import { DfmGraphComponent } from './dfm-graph.component';
import { DfmGraph } from './dfm-graph.model';
import { TranslationLoaderService } from '../../translation-loader.service';

import purchase from './dfm-graph-fixtures/purchase.json';

describe('DfmGraphComponent', () => {
  let fixture: ComponentFixture<DfmGraphComponent>;

  const graph: DfmGraph = {
    nodes: [
      {id: 'sales', label: 'Sales', type: 'FACT', optional: false, details: ['Revenue']},
      {id: 'salesperson', label: 'Salesperson', type: 'DESCRIPTIVE', optional: false, details: []},
      {id: 'day', label: 'Day', type: 'LEVEL', optional: false, details: []}
    ],
    edges: [
      {source: 'sales', target: 'salesperson', connectionType: 'SIMPLE', optional: false},
      {source: 'sales', target: 'day', connectionType: 'SIMPLE', optional: true}
    ]
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DfmGraphComponent],
      providers: [provideTransloco({
        config: {
          defaultLang: 'en',
          fallbackLang: 'en',
          availableLangs: ['en', 'de'],
          prodMode: false,
          missingHandler: {useFallbackTranslation: true, logMissingKey: false},
          flatten: {aot: false}
        },
        loader: TranslationLoaderService
      })]
    }).compileComponents();

    fixture = TestBed.createComponent(DfmGraphComponent);
  });

  it('should render nodes and edges', () => {
    fixture.componentInstance.graph = graph;
    fixture.detectChanges();
    fixture.componentInstance.ngOnChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('.dfm-node').length).toBe(3);
    expect(element.querySelectorAll('.dfm-node.fact').length).toBe(1);
    expect(element.querySelectorAll('.dfm-node.level').length).toBe(1);
    expect(element.querySelectorAll('.dfm-node.descriptive').length).toBe(1);
    expect(element.querySelectorAll('line.dfm-edge').length).toBe(2);
    expect(element.querySelectorAll('line.dfm-optional-edge').length).toBe(1);
  });

  it('should render a large graph and fit it into the viewport', () => {
    const large = purchase as DfmGraph;
    fixture.componentInstance.graph = large;
    fixture.detectChanges();
    fixture.componentInstance.ngOnChanges();

    const element: HTMLElement = fixture.nativeElement;
    const doubleLines = large.edges.filter(edge => edge.connectionType !== 'SIMPLE').length;
    expect(element.querySelectorAll('.dfm-node').length).toBe(large.nodes.length);
    expect(element.querySelectorAll('line.dfm-edge').length).toBe(large.edges.length + doubleLines);
    expect(element.querySelectorAll('line.dfm-optional-edge').length).toBe(large.edges.filter(edge => edge.optional).length);

    const transform = element.querySelector('svg > g')?.getAttribute('transform') ?? '';
    const scale = Number(/scale\(([^)]+)\)/.exec(transform)?.[1]);
    expect(scale).toBeGreaterThan(0.4);
    expect(scale).toBeLessThanOrEqual(1);
  });

  it('should clear the diagram if there is no graph', () => {
    fixture.componentInstance.graph = graph;
    fixture.detectChanges();
    fixture.componentInstance.ngOnChanges();

    fixture.componentInstance.graph = null;
    fixture.componentInstance.ngOnChanges();

    expect((fixture.nativeElement as HTMLElement).querySelectorAll('.dfm-node').length).toBe(0);
  });

  it('should download the rendered graph as a PNG', async () => {
    const originalImage = Object.getOwnPropertyDescriptor(window, 'Image');
    const originalGetContext = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'getContext');
    const originalToBlob = Object.getOwnPropertyDescriptor(HTMLCanvasElement.prototype, 'toBlob');
    const createObjectURL = jest.spyOn(URL, 'createObjectURL')
      .mockReturnValueOnce('blob:dfm-svg')
      .mockReturnValueOnce('blob:dfm-png');
    const drawImage = jest.fn();
    const getContext = jest.fn().mockReturnValue({drawImage});
    const toBlob = jest.fn((callback: BlobCallback) =>
      callback(new Blob(['png data'], {type: 'image/png'}))
    );
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {configurable: true, value: getContext});
    Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', {configurable: true, value: toBlob});
    const click = jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
      expect(this.download).toBe('dfm-model.png');
      expect(this.href).toBe('blob:dfm-png');
    });

    class MockImage {
      onload: (() => void) | null = null;
      onerror: (() => void) | null = null;
      set src(_value: string) {
        this.onload?.();
      }
    }

    Object.defineProperty(window, 'Image', {configurable: true, value: MockImage});
    fixture.componentInstance.graph = graph;
    fixture.detectChanges();

    try {
      await fixture.componentInstance.downloadPng();

      expect(createObjectURL).toHaveBeenCalledTimes(2);
      expect(getContext).toHaveBeenCalledWith('2d');
      expect(drawImage).toHaveBeenCalled();
      expect(click).toHaveBeenCalled();
    } finally {
      if (originalImage)
        Object.defineProperty(window, 'Image', originalImage);
      else
        Reflect.deleteProperty(window, 'Image');
      if (originalGetContext)
        Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', originalGetContext);
      else
        Reflect.deleteProperty(HTMLCanvasElement.prototype, 'getContext');
      if (originalToBlob)
        Object.defineProperty(HTMLCanvasElement.prototype, 'toBlob', originalToBlob);
      else
        Reflect.deleteProperty(HTMLCanvasElement.prototype, 'toBlob');
      jest.restoreAllMocks();
    }
  });
});
