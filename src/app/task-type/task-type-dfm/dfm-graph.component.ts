import { AfterViewInit, Component, ElementRef, Input, OnChanges, ViewChild, ViewEncapsulation } from '@angular/core';
import { TranslocoPipe } from '@ngneat/transloco';
import { ButtonModule } from 'primeng/button';
import {
  select,
  zoom,
  zoomIdentity,
  type ZoomBehavior,
  type ZoomTransform
} from 'd3';

import { DfmGraph } from './dfm-graph.model';
import { createGraphLayout, graphBounds, labelWidth, LayoutLink as SimLink, LayoutNode as SimNode, toLayout } from './dfm-graph-layout';

const WIDTH = 900;
const HEIGHT = 600;
const FIT_MARGIN = 48;
const PNG_SCALE = 2;
const MAX_PNG_SIZE = 8000;
const EXPORT_MARGIN = 40;
// the component styles are not part of the exported SVG, so the relevant ones are inlined
const EXPORT_STYLE_PROPERTIES = [
  'fill', 'stroke', 'stroke-width', 'font-family', 'font-size', 'font-weight', 'text-anchor', 'dominant-baseline',
  'paint-order'
];

// distance from the center of a node to its border in the direction (unitX, unitY)
function borderDistance(node: SimNode, unitX: number, unitY: number): number {
  if (node.type === 'LEVEL')
    return 10;
  const halfWidth = node.type === 'FACT' ? labelWidth(node) / 2 : 50;
  const halfHeight = node.type === 'FACT' ? (35 + node.details.length * 20) / 2 : 10;
  const horizontal = Math.abs(unitX) < 1e-9 ? Infinity : halfWidth / Math.abs(unitX);
  const vertical = Math.abs(unitY) < 1e-9 ? Infinity : halfHeight / Math.abs(unitY);
  return Math.min(horizontal, vertical);
}

/**
 * Visualizes a DFM graph as a static diagram that can be zoomed and panned.
 */
@Component({
  selector: 'dke-dfm-graph',
  standalone: true,
  imports: [ButtonModule, TranslocoPipe],
  templateUrl: './dfm-graph.component.html',
  styleUrl: './dfm-graph.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class DfmGraphComponent implements AfterViewInit, OnChanges {
  @Input() graph: DfmGraph | null = null;

  @ViewChild('svg', {static: true}) private svgRef!: ElementRef<SVGSVGElement>;

  private zoomBehavior?: ZoomBehavior<SVGSVGElement, unknown>;
  private initialTransform: ZoomTransform = zoomIdentity;
  private viewInitialized = false;
  private layoutNodes: SimNode[] = [];
  private exportSize = {width: WIDTH * PNG_SCALE, height: HEIGHT * PNG_SCALE};

  ngAfterViewInit(): void {
    this.viewInitialized = true;
    this.render();
  }

  ngOnChanges(): void {
    if (this.viewInitialized)
      this.render();
  }

  changeZoom(scale: number): void {
    if (this.zoomBehavior)
      select(this.svgRef.nativeElement).call(this.zoomBehavior.scaleBy, scale);
  }

  resetZoom(): void {
    if (this.zoomBehavior)
      select(this.svgRef.nativeElement).call(this.zoomBehavior.transform, this.initialTransform);
  }

  async downloadPng(): Promise<void> {
    const source = this.svgRef.nativeElement;
    const svg = source.cloneNode(true) as SVGSVGElement;
    const sourceElements = [source, ...Array.from(source.querySelectorAll('*'))];
    const clonedElements = [svg, ...Array.from(svg.querySelectorAll('*'))];

    sourceElements.forEach((element, index) => {
      const clone = clonedElements[index];
      if (!clone)
        return;

      const computedStyle = getComputedStyle(element);
      clone.setAttribute('style', EXPORT_STYLE_PROPERTIES
        .map(property => `${property}:${computedStyle.getPropertyValue(property)};`)
        .join(''));
    });

    // export the whole model independent of the current zoom and pan
    const bounds = this.layoutNodes.length > 0
      ? graphBounds(this.layoutNodes)
      : {left: 0, top: 0, right: WIDTH, bottom: HEIGHT};
    const left = bounds.left - EXPORT_MARGIN;
    const top = bounds.top - EXPORT_MARGIN;
    const width = bounds.right - bounds.left + EXPORT_MARGIN * 2;
    const height = bounds.bottom - bounds.top + EXPORT_MARGIN * 2;
    const scale = Math.min(PNG_SCALE, MAX_PNG_SIZE / width, MAX_PNG_SIZE / height);
    this.exportSize = {width: Math.max(1, Math.round(width * scale)), height: Math.max(1, Math.round(height * scale))};

    Array.from(svg.children).find(child => child.tagName.toLowerCase() === 'g')?.removeAttribute('transform');
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('viewBox', `${left} ${top} ${width} ${height}`);
    svg.setAttribute('width', String(this.exportSize.width));
    svg.setAttribute('height', String(this.exportSize.height));
    svg.style.removeProperty('width');
    svg.style.removeProperty('height');

    const background = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    background.setAttribute('x', String(left));
    background.setAttribute('y', String(top));
    background.setAttribute('width', String(width));
    background.setAttribute('height', String(height));
    background.setAttribute('fill', '#fff');
    svg.insertBefore(background, svg.firstChild);

    const svgUrl = URL.createObjectURL(new Blob(
      [new XMLSerializer().serializeToString(svg)],
      {type: 'image/svg+xml;charset=utf-8'}
    ));

    try {
      const png = await this.renderSvgAsPng(svgUrl);
      const pngUrl = URL.createObjectURL(png);
      try {
        const link = document.createElement('a');
        link.href = pngUrl;
        link.download = 'dfm-model.png';
        link.style.display = 'none';
        document.body.append(link);
        try {
          link.click();
        } finally {
          link.remove();
        }
      } finally {
        setTimeout(() => URL.revokeObjectURL(pngUrl), 0);
      }
    } finally {
      URL.revokeObjectURL(svgUrl);
    }
  }

  private renderSvgAsPng(svgUrl: string): Promise<Blob> {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = this.exportSize.width;
          canvas.height = this.exportSize.height;
          const context = canvas.getContext('2d');
          if (!context) {
            reject(new Error('Could not create a canvas context for the DFM preview'));
            return;
          }

          context.drawImage(image, 0, 0, canvas.width, canvas.height);
          canvas.toBlob(blob => blob
            ? resolve(blob)
            : reject(new Error('Could not encode the DFM preview as PNG')), 'image/png');
        } catch (error) {
          reject(error);
        }
      };
      image.onerror = () => reject(new Error('Could not render the DFM preview SVG'));
      image.src = svgUrl;
    });
  }

  private render(): void {
    const svg = select(this.svgRef.nativeElement);
    svg.on('.zoom', null);
    svg.selectAll('*').remove();
    this.zoomBehavior = undefined;
    this.initialTransform = zoomIdentity;
    this.layoutNodes = [];

    const graph = this.graph;
    if (!graph || graph.nodes.length === 0)
      return;

    const {nodes, links} = toLayout(graph);
    this.layoutNodes = nodes;

    svg.append('defs')
      .append('marker')
      .attr('id', 'dfm-convergence-arrow')
      .attr('viewBox', '0 0 10 10')
      .attr('refX', 8)
      .attr('refY', 5)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M 0 0 L 10 5 L 0 10 z')
      .attr('fill', '#64748b');

    const content = svg.append('g');
    // the wheel is not used for zooming, so that scrolling the page keeps working
    this.zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.4, 3])
      .filter(event => event.type !== 'wheel' && !event.button)
      .on('zoom', event => content.attr('transform', event.transform.toString()));
    svg.call(this.zoomBehavior);

    const edgeSelection = content.append('g')
      .selectAll<SVGGElement, SimLink>('g')
      .data(links)
      .join('g');

    edgeSelection.each(function (link) {
      const segmentCount = link.connectionType === 'MULTIPLE' || link.connectionType === 'CONVERGENCE' ? 2 : 1;
      const group = select(this);
      group.selectAll<SVGLineElement, number>('line.dfm-edge')
        .data(Array.from({length: segmentCount}, (_, index) => index))
        .join('line')
        .attr('class', 'dfm-edge')
        .attr('marker-end', index => link.connectionType === 'CONVERGENCE' && index === 0
          ? 'url(#dfm-convergence-arrow)'
          : null);
      group.selectAll('line.dfm-optional-edge')
        .data(link.optional ? [0] : [])
        .join('line')
        .attr('class', 'dfm-optional-edge');
      group.selectAll<SVGTextElement, string>('text.dfm-edge-label')
        .data(link.label ? [link.label] : [])
        .join('text')
        .attr('class', 'dfm-edge-label')
        .attr('text-anchor', 'middle')
        .text(label => label);
    });

    const nodeSelection = content.append('g')
      .selectAll<SVGGElement, SimNode>('g')
      .data(nodes)
      .join('g')
      .attr('class', node => `dfm-node ${node.type.toLowerCase()}`);

    nodeSelection.each(function (node) {
      const group = select(this);
      if (node.type === 'FACT') {
        const measureCount = node.details.length;
        const height = 35 + measureCount * 20;
        const half = labelWidth(node) / 2;
        const truncate = (text: string, maxChars: number) =>
          text.length > maxChars ? `${text.slice(0, Math.max(1, maxChars - 1))}…` : text;
        group.append('rect').attr('x', -half).attr('y', -height / 2).attr('width', half * 2).attr('height', height).attr('rx', 10);
        group.append('text')
          .attr('class', 'dfm-box-label')
          .attr('text-anchor', 'middle')
          .attr('y', -height / 2 + 22)
          .text(truncate(node.label, Math.floor((half * 2 - 24) / 8)))
          .append('title').text(node.label);
        group.append('line')
          .attr('class', 'dfm-divider')
          .attr('x1', -half).attr('x2', half)
          .attr('y1', -height / 2 + 30).attr('y2', -height / 2 + 30);
        node.details.forEach((measure, index) => {
          const y = -height / 2 + 50 + index * 20;
          group.append('text').attr('class', 'dfm-measure-label').attr('x', -half + 10).attr('y', y)
            .text(truncate(measure, Math.floor((half * 2 - 35) / 6.5)))
            .append('title').text(measure);
        });
      } else if (node.type === 'LEVEL') {
        group.append('circle').attr('r', 10);
        group.append('text').attr('class', 'dfm-node-label').attr('text-anchor', 'middle').attr('y', 24).text(node.label);
        if (node.optional)
          group.append('line').attr('class', 'dfm-level-optional').attr('x1', -15).attr('x2', 15).attr('y1', 0).attr('y2', 0);
      } else {
        group.append('text')
          .attr('class', 'dfm-node-label')
          .attr('text-anchor', 'middle')
          .attr('dominant-baseline', 'middle')
          .text(node.label);
        group.append('line').attr('class', 'dfm-descriptive-underline').attr('x1', -50).attr('x2', 50).attr('y1', 10).attr('y2', 10);
      }
    });

    const updatePositions = () => {
      edgeSelection.each(function (link) {
        const source = link.source as SimNode;
        const target = link.target as SimNode;
        const sx = source.x ?? 0, sy = source.y ?? 0, tx = target.x ?? 0, ty = target.y ?? 0;
        const length = Math.hypot(tx - sx, ty - sy) || 1;
        const px = -(ty - sy) / length, py = (tx - sx) / length;
        const mx = (sx + tx) / 2, my = (sy + ty) / 2;
        const offset = (index: number) => link.connectionType === 'MULTIPLE' ? (index === 0 ? 2.5 : -2.5) : 0;
        const convergence = link.connectionType === 'CONVERGENCE';

        select(this).selectAll<SVGLineElement, number>('line.dfm-edge')
          .attr('x1', index => (convergence && index === 1 ? mx : sx) + px * offset(index))
          .attr('y1', index => (convergence && index === 1 ? my : sy) + py * offset(index))
          .attr('x2', index => (convergence && index === 0 ? mx : tx) + px * offset(index))
          .attr('y2', index => (convergence && index === 0 ? my : ty) + py * offset(index));

        select(this).select('line.dfm-optional-edge')
          .attr('x1', mx + px * 5).attr('y1', my + py * 5)
          .attr('x2', mx - px * 5).attr('y2', my - py * 5);

        // the label belongs to the visible part of the edge (between the node borders); only optional and
        // convergence edges keep their middle free for the marker or arrow, so the label is shifted there towards
        // the lower node because node names hang below the nodes
        const unitX = (tx - sx) / length, unitY = (ty - sy) / length;
        const startClip = borderDistance(source, unitX, unitY);
        const endClip = borderDistance(target, -unitX, -unitY);
        const visibleLength = length - startClip - endClip;
        const visibleMiddleX = mx + unitX * (startClip - endClip) / 2;
        const visibleMiddleY = my + unitY * (startClip - endClip) / 2;
        const labelHalfWidth = (link.label?.length ?? 0) * 6.2 / 2;
        const labelHalfHeight = 6.5;
        const dirX = ty < sy ? -unitX : unitX, dirY = Math.abs(unitY);
        const extent = Math.abs(dirX) * labelHalfWidth + Math.abs(dirY) * labelHalfHeight;
        const reserveMiddle = link.optional || convergence;
        let labelX = visibleMiddleX, labelY = visibleMiddleY;
        if (reserveMiddle && 9 + 2 * extent + 2 <= visibleLength / 2) {
          labelX = visibleMiddleX + dirX * (extent + 9);
          labelY = visibleMiddleY + dirY * (extent + 9);
        } else if (reserveMiddle || 2 * extent + 2 > visibleLength) {
          // the edge is too short, so the label is placed beside the edge instead
          const side = py > 0 ? -1 : 1;
          const offset = 9 + Math.abs(px) * labelHalfWidth + Math.abs(py) * labelHalfHeight;
          labelX = visibleMiddleX + px * side * offset;
          labelY = visibleMiddleY + py * side * offset;
        }
        select(this).select('text.dfm-edge-label')
          .attr('x', labelX)
          .attr('y', labelY + 4);
      });
      nodeSelection.attr('transform', node => `translate(${node.x ?? 0},${node.y ?? 0})`);
    };

    // the layout is computed once and the diagram is static, only the view can be zoomed and panned
    createGraphLayout(nodes, links);
    updatePositions();

    const bounds = graphBounds(nodes);
    const width = bounds.right - bounds.left;
    const height = bounds.bottom - bounds.top;
    const scale = Math.min((WIDTH - FIT_MARGIN * 2) / width, (HEIGHT - FIT_MARGIN * 2) / height, 1);
    this.initialTransform = zoomIdentity
      .translate(WIDTH / 2, HEIGHT / 2)
      .scale(scale)
      .translate(-(bounds.left + bounds.right) / 2, -(bounds.top + bounds.bottom) / 2);
    svg.call(this.zoomBehavior.transform, this.initialTransform);
  }
}
