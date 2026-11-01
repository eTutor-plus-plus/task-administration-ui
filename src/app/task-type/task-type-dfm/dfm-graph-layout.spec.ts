import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

import { DfmGraph } from './dfm-graph.model';
import { createGraphLayout, graphBounds, LayoutNode, nodeBounds, toLayout } from './dfm-graph-layout';

// The fixtures contain the graphs produced by the real DFM parser for different model constellations.
const FIXTURE_DIRECTORY = join(__dirname, 'dfm-graph-fixtures');
const scenarios: Record<string, DfmGraph> = Object.fromEntries(readdirSync(FIXTURE_DIRECTORY)
  .filter(file => file.endsWith('.json'))
  .map(file => [file.replace(/\.json$/, ''), JSON.parse(readFileSync(join(FIXTURE_DIRECTORY, file), 'utf8')) as DfmGraph]));

const MINIMUM_READABLE_SCALE = 0.4;
// the canvas has a fixed size, so very large models are fitted smaller and are meant to be read by zooming in
const MINIMUM_SCALE_BY_SCENARIO: Record<string, number> = {'large-model': 0.25};
const VIEWPORT = {width: 900, height: 600, margin: 48};

function layout(graph: DfmGraph): LayoutNode[] {
  const {nodes, links} = toLayout(graph);
  createGraphLayout(nodes, links);
  return nodes;
}

function overlappingNodes(nodes: LayoutNode[]): string[] {
  const boxes = nodes.map(node => ({label: node.label, ...nodeBounds(node)}));
  return boxes.flatMap((first, index) => boxes.slice(index + 1)
    .filter(second => first.left < second.right && first.right > second.left
      && first.top < second.bottom && first.bottom > second.top)
    .map(second => `${first.label} / ${second.label}`));
}

function segmentCrossesBox(x1: number, y1: number, x2: number, y2: number, box: ReturnType<typeof nodeBounds>): boolean {
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
    });
  });

  it('should keep all facts pinned and apart', () => {
    const nodes = layout(scenarios['three-facts-own-dimensions']);
    const facts = nodes.filter(node => node.type === 'FACT');

    expect(facts).toHaveLength(3);
    facts.forEach(fact => {
      expect(fact.fx).toBeDefined();
      expect(fact.fy).toBeDefined();
    });
    expect(overlappingNodes(facts)).toEqual([]);
  });
});
