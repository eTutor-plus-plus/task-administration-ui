import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { DfmGraph } from './dfm-graph.model';
import {
  Bounds,
  createGraphLayout,
  edgeLabelBounds,
  edgeLabelCenter,
  graphBounds,
  isSelfLink,
  LayoutLink,
  LayoutNode,
  nodeBounds,
  selfLoopShape,
  toLayout
} from './dfm-graph-layout';
import { randomGraph } from './testdata/random-graphs';

// The fixtures contain the graphs produced by the real DFM parser for different model constellations.
const FIXTURE_DIRECTORY = join(__dirname, 'testdata', 'graph-fixtures');
const scenarios: Record<string, DfmGraph> = Object.fromEntries(readdirSync(FIXTURE_DIRECTORY)
  .filter(file => file.endsWith('.json'))
  .map(file => [file.replace(/\.json$/, ''), JSON.parse(readFileSync(join(FIXTURE_DIRECTORY, file), 'utf8')) as DfmGraph]));

const MINIMUM_READABLE_SCALE = 0.4;
// the canvas has a fixed size, so very large models are fitted smaller and are meant to be read by zooming in
const MINIMUM_SCALE_BY_SCENARIO: Record<string, number> = {'large-model': 0.25};
const VIEWPORT = {width: 900, height: 600, margin: 48};
// longest edge in the fixtures; guards against the layout getting looser
const MAXIMUM_EDGE_LENGTH = 360;
// a cross-dimensional attribute joins branches that lie on opposite sides of the fact, so its edge is longer
const MAXIMUM_EDGE_LENGTH_BY_SCENARIO: Record<string, number> = {'shared-and-cross-hierarchies': 500};

// Random models find layout problems that hand-written fixtures miss. The seeds are fixed, so a failure can be
// reproduced. DFM_LAYOUT_SEEDS=61-260 checks other models, DFM_LAYOUT_REPORT=1 prints the findings of every model
// instead of failing.
const [FIRST_SEED, LAST_SEED] = (process.env['DFM_LAYOUT_SEEDS'] ?? '1-60').split('-').map(Number);
const RANDOM_SEEDS = Array.from({length: LAST_SEED - FIRST_SEED + 1}, (_, index) => FIRST_SEED + index);
const REPORT = Boolean(process.env['DFM_LAYOUT_REPORT']);

function layout(graph: DfmGraph): LayoutNode[] {
  return layoutWithLinks(graph).nodes;
}

function layoutWithLinks(graph: DfmGraph): { nodes: LayoutNode[]; links: LayoutLink[] } {
  const {nodes, links} = toLayout(graph);
  createGraphLayout(nodes, links);
  return {nodes, links};
}

function intersects(first: Bounds, second: Bounds): boolean {
  return first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
}

interface EdgeLabel extends Bounds {
  text: string;
  link: LayoutLink;
}

// descriptions of the edges as they are drawn, including the roles of recursive hierarchies
function edgeLabels(links: LayoutLink[]): EdgeLabel[] {
  return links.filter(link => link.label).map(link => {
    const source = link.source as LayoutNode;
    const target = link.target as LayoutNode;
    const center = isSelfLink(link)
      ? (shape => ({x: shape.labelX, y: shape.labelY}))(selfLoopShape(source, links, link.label))
      : edgeLabelCenter(link, source, target);
    return {text: link.label!, link, ...edgeLabelBounds(link.label!, center)};
  });
}

/**
 * Everything that makes a laid out graph hard to read. Edges are measured between the node centers.
 */
function layoutFindings(graph: DfmGraph) {
  const {nodes, links} = layoutWithLinks(graph);
  const ends = (link: LayoutLink) => [link.source as LayoutNode, link.target as LayoutNode];
  const labels = edgeLabels(links);
  const segments = links.filter(link => !isSelfLink(link));

  // a description hidden behind a node (e.g. the box of a fact) cannot be read
  const labelsCoveredByNodes = labels.flatMap(label => nodes
    .filter(node => intersects(label, nodeBounds(node)))
    .map(node => `${label.text} / ${node.label}`));
  const overlappingLabels = labels.flatMap((first, index) => labels.slice(index + 1)
    .filter(second => intersects(first, second))
    .map(second => `${first.text} / ${second.text}`));
  // a description on the line of another edge is easily read as belonging to that edge
  const labelsOnForeignEdges = labels.flatMap(label => segments
    .filter(link => link !== label.link)
    .filter(link => {
      const [source, target] = ends(link);
      return segmentCrossesBox(source.x!, source.y!, target.x!, target.y!, label);
    })
    .map(link => `${label.text} on ${ends(link).map(node => node.label).join(' -> ')}`));
  const loopsCoveringNodes = links.filter(isSelfLink).flatMap(link => {
    const level = link.source as LayoutNode;
    const bounds = selfLoopShape(level, links, link.label).bounds;
    return nodes.filter(node => node !== level && intersects(bounds, nodeBounds(node)))
      .map(node => `${link.label} / ${node.label}`);
  });
  const longestEdge = Math.max(0, ...segments.map(link => {
    const [source, target] = ends(link);
    return Math.hypot(target.x! - source.x!, target.y! - source.y!);
  }));

  return {
    overlappingNodes: overlappingNodes(nodes),
    edgesCrossingNodes: edgesCrossingNodes(graph, nodes),
    crossingEdges: edgesCrossingEachOther(graph, nodes),
    labelsCoveredByNodes,
    overlappingLabels,
    labelsOnForeignEdges,
    loopsCoveringNodes,
    longestEdge
  };
}

function overlappingNodes(nodes: LayoutNode[]): string[] {
  const boxes = nodes.map(node => ({label: node.label, ...nodeBounds(node)}));
  return boxes.flatMap((first, index) => boxes.slice(index + 1)
    .filter(second => first.left < second.right && first.right > second.left
      && first.top < second.bottom && first.bottom > second.top)
    .map(second => `${first.label} / ${second.label}`));
}

function segmentCrossesBox(x1: number, y1: number, x2: number, y2: number, box: Bounds): boolean {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let minimum = 0;
  let maximum = 1;
  const clip = (p: number, q: number) => {
    if (Math.abs(p) < 1e-9)
      return q >= 0;
    const ratio = q / p;
    if (p < 0) {
      if (ratio > maximum)
        return false;
      minimum = Math.max(minimum, ratio);
    } else {
      if (ratio < minimum)
        return false;
      maximum = Math.min(maximum, ratio);
    }
    return true;
  };
  return clip(-dx, x1 - box.left) && clip(dx, box.right - x1) && clip(-dy, y1 - box.top) && clip(dy, box.bottom - y1)
    && maximum - minimum > 0.02;
}

function edgesCrossingNodes(graph: DfmGraph, nodes: LayoutNode[]): string[] {
  const byId = new Map(nodes.map(node => [node.id, node]));
  return graph.edges.flatMap(edge => {
    const source = byId.get(edge.source)!;
    const target = byId.get(edge.target)!;
    return nodes
      .filter(node => node !== source && node !== target)
      .filter(node => segmentCrossesBox(source.x!, source.y!, target.x!, target.y!, nodeBounds(node)))
      .map(node => `${source.label} -> ${target.label} crosses ${node.label}`);
  });
}

function edgesCrossingEachOther(graph: DfmGraph, nodes: LayoutNode[]): string[] {
  const byId = new Map(nodes.map(node => [node.id, node]));
  const segments = graph.edges.map(edge => {
    const source = byId.get(edge.source)!;
    const target = byId.get(edge.target)!;
    return {name: `${source.label} -> ${target.label}`, x1: source.x!, y1: source.y!, x2: target.x!, y2: target.y!};
  });
  const crossing = (a: typeof segments[number], b: typeof segments[number]) => {
    const rx = a.x2 - a.x1;
    const ry = a.y2 - a.y1;
    const sx = b.x2 - b.x1;
    const sy = b.y2 - b.y1;
    const denominator = rx * sy - ry * sx;
    if (Math.abs(denominator) < 1e-9)
      return false;
    const qx = b.x1 - a.x1;
    const qy = b.y1 - a.y1;
    const t = (qx * sy - qy * sx) / denominator;
    const u = (qx * ry - qy * rx) / denominator;
    return t > 0.03 && t < 0.97 && u > 0.03 && u < 0.97;
  };
  return segments.flatMap((first, index) => segments.slice(index + 1)
    .filter(second => crossing(first, second))
    .map(second => `${first.name} x ${second.name}`));
}

describe('DFM graph layout', () => {
  Object.entries(scenarios).forEach(([name, graph]) => {
    describe(name, () => {
      it('should not overlap nodes', () => {
        expect(overlappingNodes(layout(graph))).toEqual([]);
      });

      it('should not route edges through other nodes', () => {
        expect(edgesCrossingNodes(graph, layout(graph))).toEqual([]);
      });

      it('should not cross edges', () => {
        expect(edgesCrossingEachOther(graph, layout(graph))).toEqual([]);
      });

      it('should stay readable when fitted into the viewport', () => {
        const bounds = graphBounds(layout(graph));
        const scale = Math.min(
          (VIEWPORT.width - VIEWPORT.margin * 2) / (bounds.right - bounds.left),
          (VIEWPORT.height - VIEWPORT.margin * 2) / (bounds.bottom - bounds.top),
          1
        );
        expect(scale).toBeGreaterThanOrEqual(MINIMUM_SCALE_BY_SCENARIO[name] ?? MINIMUM_READABLE_SCALE);
      });

      it('should produce finite and deterministic positions', () => {
        const first = layout(graph).map(node => [node.id, node.x, node.y]);
        const second = layout(graph).map(node => [node.id, node.x, node.y]);

        expect(first.every(([, x, y]) => Number.isFinite(x) && Number.isFinite(y))).toBe(true);
        expect(second).toEqual(first);
      });

      it('should keep edge descriptions and recursive hierarchies readable', () => {
        const {labelsCoveredByNodes, overlappingLabels, labelsOnForeignEdges, loopsCoveringNodes} = layoutFindings(graph);
        expect({labelsCoveredByNodes, overlappingLabels, labelsOnForeignEdges, loopsCoveringNodes})
          .toEqual({labelsCoveredByNodes: [], overlappingLabels: [], labelsOnForeignEdges: [], loopsCoveringNodes: []});
      });

      it('should not stretch edges so far that hierarchies fall apart', () => {
        expect(layoutFindings(graph).longestEdge)
          .toBeLessThanOrEqual(MAXIMUM_EDGE_LENGTH_BY_SCENARIO[name] ?? MAXIMUM_EDGE_LENGTH);
      });
    });
  });

  describe('random models', () => {
    it.each(RANDOM_SEEDS)('should lay out model %i without overlaps', seed => {
      const graph = randomGraph(seed);
      const {longestEdge, ...findings} = layoutFindings(graph);
      if (REPORT) {
        console.log(`LAYOUT ${JSON.stringify({
          seed,
          nodes: graph.nodes.length,
          longestEdge: Math.round(longestEdge),
          ...Object.fromEntries(Object.entries(findings).map(([key, value]) => [key, value.length]))
        })}`);
        return;
      }
      expect(findings).toEqual({
        overlappingNodes: [],
        edgesCrossingNodes: [],
        crossingEdges: [],
        labelsCoveredByNodes: [],
        overlappingLabels: [],
        labelsOnForeignEdges: [],
        loopsCoveringNodes: []
      });
    });
  });

  it('should keep recursive hierarchies out of the tree layout and make room for their loop', () => {
    const graph = scenarios['recursive-hierarchy'];
    const {nodes, links} = toLayout(graph);
    createGraphLayout(nodes, links);

    const loop = links.find(link => link.label === 'supervisor')!;
    expect(loop.source).toBe(loop.target);
    expect(typeof loop.source).toBe('object');

    const level = loop.source as LayoutNode;
    const shape = selfLoopShape(level, links, loop.label);
    expect(Object.values(shape.bounds).every(Number.isFinite)).toBe(true);
    expect(shape.path).not.toContain('NaN');
    expect(graphBounds(nodes, links).top).toBeLessThanOrEqual(shape.bounds.top);
    expect(graphBounds(nodes, links).left).toBeLessThanOrEqual(shape.bounds.left);
    expect(graphBounds(nodes, links).right).toBeGreaterThanOrEqual(shape.bounds.right);
    expect(graphBounds(nodes, links).bottom).toBeGreaterThanOrEqual(shape.bounds.bottom);
  });

  it('should point a self-loop away from edges on opposite sides', () => {
    const node = {id: 'a', label: 'a', type: 'LEVEL', optional: false, details: [], x: 0, y: 0} as LayoutNode;
    const left = {id: 'l', label: 'l', type: 'LEVEL', optional: false, details: [], x: -100, y: 0} as LayoutNode;
    const right = {id: 'r', label: 'r', type: 'LEVEL', optional: false, details: [], x: 100, y: 0} as LayoutNode;
    const links = [
      {source: left, target: node, connectionType: 'SIMPLE', optional: false},
      {source: right, target: node, connectionType: 'SIMPLE', optional: false},
      {source: node, target: node, connectionType: 'CONVERGENCE', optional: false, label: 'supervisor'}
    ];

    const shape = selfLoopShape(node, links, 'supervisor');

    expect(Math.abs(shape.labelX)).toBeLessThan(5);
    expect(shape.labelY).toBeLessThan(-40);
  });

  it('should keep all facts apart', () => {
    const nodes = layout(scenarios['three-facts-own-dimensions']);
    const facts = nodes.filter(node => node.type === 'FACT');

    expect(facts).toHaveLength(3);
    expect(overlappingNodes(facts)).toEqual([]);
  });
});
