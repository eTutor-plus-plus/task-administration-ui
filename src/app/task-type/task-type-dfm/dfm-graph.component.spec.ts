import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTransloco } from '@ngneat/transloco';

import { DfmGraphComponent } from './dfm-graph.component';
import { DfmGraph } from './dfm-graph.model';
import { TranslationLoaderService } from '../../translation-loader.service';

import purchase from './testdata/graph-fixtures/purchase.json';
import recursive from './testdata/graph-fixtures/recursive-hierarchy.json';
import recursiveShared from './testdata/graph-fixtures/recursive-shared-hierarchy.json';
import sharedAndCross from './testdata/graph-fixtures/shared-and-cross-hierarchies.json';

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

  it('should render shared hierarchies as double circles and cross-dimensional attributes with an arc', () => {
    fixture.componentInstance.graph = sharedAndCross as DfmGraph;
    fixture.detectChanges();
    fixture.componentInstance.ngOnChanges();

    const element: HTMLElement = fixture.nativeElement;
    expect(element.querySelectorAll('.dfm-node.shared').length).toBe(1);
    expect(element.querySelectorAll('.dfm-node.shared circle').length).toBe(2);
    expect(element.querySelectorAll('.dfm-node.shared .dfm-shared-ring').length).toBe(1);
    expect(element.querySelectorAll('.dfm-node.cross').length).toBe(1);
    expect(element.querySelectorAll('.dfm-node.cross circle').length).toBe(1);
    expect(element.querySelectorAll('.dfm-node.cross .dfm-cross-arc').length).toBe(1);
    expect(element.querySelector('.dfm-node.cross .dfm-cross-arc')?.getAttribute('d')).toMatch(/^M .* A .* A /);
    expect(element.querySelector('.dfm-node.cross .dfm-node-label')?.getAttribute('y')).toBe('30');
    expect(element.querySelectorAll('.dfm-node.level circle').length).toBe(
      (sharedAndCross as DfmGraph).nodes.filter(node => node.type === 'LEVEL').length);
  });

  it('should render connection descriptions only for described edges', () => {
    fixture.componentInstance.graph = {
      ...graph,
      edges: [
        {source: 'sales', target: 'salesperson', connectionType: 'SIMPLE', optional: false, label: null},
        {source: 'sales', target: 'day', connectionType: 'SIMPLE', optional: false, label: 'salesday'}
      ]
    };
    fixture.detectChanges();
    fixture.componentInstance.ngOnChanges();

    const labels = Array.from((fixture.nativeElement as HTMLElement).querySelectorAll('text.dfm-edge-label'));
    expect(labels.map(label => label.textContent)).toEqual(['salesday']);
  });

  it('should render parallel connections as distinct curves with their own roles', () => {
    fixture.componentInstance.graph = {
      ...graph,
      edges: [
        {source: 'sales', target: 'day', connectionType: 'SIMPLE', optional: true, label: 'shipping'},
        {source: 'sales', target: 'day', connectionType: 'MULTIPLE', optional: false, label: 'billing'}
      ]
    };
    fixture.detectChanges();
    fixture.componentInstance.ngOnChanges();
    const element: HTMLElement = fixture.nativeElement;
    const paths = Array.from(element.querySelectorAll('path.dfm-edge'));
    expect(paths.length).toBe(3);
    expect(new Set(paths.map(path => path.getAttribute('d'))).size).toBe(3);
    expect(element.querySelectorAll('line.dfm-optional-edge').length).toBe(1);
    expect(Array.from(element.querySelectorAll('text.dfm-edge-label')).map(label => label.textContent))
      .toEqual(['shipping', 'billing']);
  });

  it('should place straight and parallel convergence arrows at the target border', () => {
    fixture.componentInstance.graph = {
      nodes: [
        {id: 'sales', label: 'Sales', type: 'FACT', optional: false, details: []},
        {id: 'day', label: 'Day', type: 'LEVEL', optional: false, details: []},
        {id: 'year', label: 'Year', type: 'SHARED', optional: false, details: []}
      ],
      edges: [
        {source: 'sales', target: 'day', connectionType: 'CONVERGENCE', optional: false},
        {source: 'day', target: 'year', connectionType: 'CONVERGENCE', optional: false},
        {source: 'day', target: 'year', connectionType: 'CONVERGENCE', optional: true, label: 'alternative'}
      ]
    };
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const groups = element.querySelectorAll('svg > g > g:first-child > g');
    const nodes = element.querySelectorAll('.dfm-node');
    const number = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
    expect(groups.length).toBe(3);
    [1, 2, 2].forEach((targetIndex, index) => {
      const segments = groups[index].querySelectorAll('.dfm-edge');
      expect(segments.length).toBe(2);
      expect(segments[0].hasAttribute('marker-end')).toBe(false);
      const arrow = segments[1];
      expect(arrow.getAttribute('marker-end')).toBe('url(#dfm-convergence-arrow)');
      const coordinates = arrow.tagName.toLowerCase() === 'path'
        ? (arrow.getAttribute('d')!.match(number) ?? []).map(Number).slice(-2)
        : [Number(arrow.getAttribute('x2')), Number(arrow.getAttribute('y2'))];
      const center = (nodes[targetIndex].getAttribute('transform')!.match(number) ?? []).map(Number);
      expect(Math.hypot(coordinates[0] - center[0], coordinates[1] - center[1]))
        .toBeCloseTo(targetIndex === 2 ? 14 : 10, 4);
    });
    expect(groups[2].querySelector('line.dfm-optional-edge')).not.toBeNull();
    expect(element.querySelector('#dfm-convergence-arrow')?.getAttribute('refX')).toBe('10');
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

  it('should render a recursive hierarchy as a self-loop with its role', () => {
    fixture.componentInstance.graph = recursive as DfmGraph;
    fixture.detectChanges();
    fixture.componentInstance.ngOnChanges();

    const element: HTMLElement = fixture.nativeElement;
    const loop = element.querySelector('path.dfm-edge');
    expect(loop?.getAttribute('d')).toMatch(/^M [-\d. ]+ C /);
    expect(loop?.getAttribute('d')).not.toContain('NaN');
    expect(loop?.getAttribute('marker-end')).toBe('url(#dfm-convergence-arrow)');
    expect(element.querySelectorAll('line.dfm-edge').length).toBe(2);
    expect(Array.from(element.querySelectorAll('text.dfm-edge-label')).map(label => label.textContent)).toEqual(['supervisor']);
  });

  it('should attach recursive shared hierarchy loops to the outer ring', () => {
    fixture.componentInstance.graph = recursiveShared as DfmGraph;
    fixture.detectChanges();

    const element: HTMLElement = fixture.nativeElement;
    const loop = element.querySelector('path.dfm-edge')!;
    const node = element.querySelector('.dfm-node.shared')!;
    const number = /-?\d*\.?\d+(?:e[-+]?\d+)?/gi;
    const coordinates = (loop.getAttribute('d')!.match(number) ?? []).map(Number);
    const center = (node.getAttribute('transform')!.match(number) ?? []).map(Number);
    expect(loop.getAttribute('marker-end')).toBe('url(#dfm-convergence-arrow)');
    for (const point of [coordinates.slice(0, 2), coordinates.slice(-2)]) {
      expect(Math.hypot(point[0] - center[0], point[1] - center[1])).toBeCloseTo(14, 4);
    }
  });

  it('should render distinct optional recursive connections', () => {
    fixture.componentInstance.graph = {
      nodes: [{id: 'worker', label: 'worker', type: 'LEVEL', optional: false, details: []}],
      edges: [
        {source: 'worker', target: 'worker', connectionType: 'SIMPLE', optional: true, label: 'alternate'},
        {source: 'worker', target: 'worker', connectionType: 'CONVERGENCE', optional: true, label: 'supervisor'}
      ]
    };
    fixture.detectChanges();
    fixture.componentInstance.ngOnChanges();
    const element: HTMLElement = fixture.nativeElement;
    const paths = Array.from(element.querySelectorAll('path.dfm-edge'));
    expect(paths.length).toBe(2);
    expect(new Set(paths.map(path => path.getAttribute('d'))).size).toBe(2);
    expect(element.querySelectorAll('line.dfm-optional-edge').length).toBe(2);
    expect(element.querySelectorAll('path.dfm-edge[marker-end]').length).toBe(1);
    expect(Array.from(element.querySelectorAll('text.dfm-edge-label')).map(label => label.textContent))
      .toEqual(['alternate', 'supervisor']);
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
