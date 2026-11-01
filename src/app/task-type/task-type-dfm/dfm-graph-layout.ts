import {
  forceCollide,
  forceLink,
  forceManyBody,
  forceSimulation,
  type Force,
  type Simulation,
  type SimulationLinkDatum,
  type SimulationNodeDatum
} from 'd3';

import { DfmEdge, DfmGraph, DfmNode } from './dfm-graph.model';

export interface LayoutNode extends DfmNode, SimulationNodeDatum {
}

export interface LayoutLink extends SimulationLinkDatum<LayoutNode> {
  source: string | LayoutNode;
  target: string | LayoutNode;
  connectionType: string;
  optional: boolean;
}

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const LEVEL_GAP = 90;
const TREE_GAP = 140;
const PADDING = 14;

/**
 * Approximate rendered width of a node including its label.
 */
export function labelWidth(node: DfmNode): number {
  if (node.type === 'FACT') {
    const longest = Math.max(node.label.length * 8, ...node.details.map(detail => detail.length * 6.5 + 20));
    return Math.max(130, longest + 24);
  }
  if (node.type === 'DESCRIPTIVE')
    return Math.max(110, node.label.length * 6.6 + 12);
  return Math.max(44, node.label.length * 6.6 + 12);
}

export function collisionRadius(node: DfmNode): number {
  if (node.type === 'FACT')
    return Math.max(labelWidth(node) / 2 + 12, (35 + node.details.length * 20) / 2 + 20);
  if (node.type === 'LEVEL')
    return Math.max(34, labelWidth(node) / 2 + 10);
  return Math.max(56, labelWidth(node) / 2 + 6);
}

/**
 * Approximate bounding box of a positioned node (symbol and label).
 */
export function nodeBounds(node: LayoutNode): Bounds {
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  const half = labelWidth(node) / 2;
  if (node.type === 'FACT') {
    const height = 35 + node.details.length * 20;
    return {left: x - half, right: x + half, top: y - height / 2, bottom: y + height / 2};
  }
  if (node.type === 'LEVEL')
    return {left: x - half, right: x + half, top: y - 10, bottom: y + 30};
  return {left: x - half, right: x + half, top: y - 12, bottom: y + 12};
}

export function graphBounds(nodes: LayoutNode[]): Bounds {
  const boxes = nodes.map(nodeBounds);
  return {
    left: Math.min(...boxes.map(box => box.left)),
    top: Math.min(...boxes.map(box => box.top)),
    right: Math.max(...boxes.map(box => box.right)),
    bottom: Math.max(...boxes.map(box => box.bottom))
  };
}

export function toLayout(graph: DfmGraph): { nodes: LayoutNode[]; links: LayoutLink[] } {
  return {
    nodes: graph.nodes.map(node => ({...node})),
    links: graph.edges.map((edge: DfmEdge) => ({...edge}))
  };
}

/**
 * Places the attribute trees radially: facts are the roots, leaves share the outer ring and inner levels sit
 * on rings in between, so tree edges do not need to cross other nodes. Facts are pinned to their position.
 */
export function placeRadialTrees(nodes: LayoutNode[], edges: { source: string | LayoutNode; target: string | LayoutNode }[]): void {
  const byId = new Map(nodes.map(node => [node.id, node]));
  const id = (end: string | LayoutNode) => typeof end === 'string' ? end : end.id;
  const outgoing = new Map<string, string[]>();
  const incoming = new Map<string, string[]>();
  edges.forEach(edge => {
    outgoing.set(id(edge.source), [...(outgoing.get(id(edge.source)) ?? []), id(edge.target)]);
    incoming.set(id(edge.target), [...(incoming.get(id(edge.target)) ?? []), id(edge.source)]);
  });

  // nodes with several parents (e.g. a year reached from month and calendar week) are not part of the tree,
  // they are placed between their parents one ring further out, so their edges do not span the whole fan
  const merges = nodes.filter(node => node.type !== 'FACT' && (incoming.get(node.id)?.length ?? 0) > 1);
  const mergeIds = new Set(merges.map(node => node.id));
  const mergeChildren = new Map<string, LayoutNode[]>();
  for (const merge of merges) {
    const queue = [merge];
    for (let index = 0; index < queue.length; index++) {
      for (const targetId of outgoing.get(queue[index].id) ?? []) {
        const target = byId.get(targetId);
        if (!target || mergeIds.has(targetId))
          continue;
        mergeChildren.set(queue[index].id, [...(mergeChildren.get(queue[index].id) ?? []), target]);
        queue.push(target);
      }
    }
  }
  const owned = new Set([...mergeChildren.values()].flat().map(node => node.id));

  const levelOf = new Map<string, number>(nodes.map(node => [node.id, 0]));
  for (let pass = 0; pass < nodes.length; pass++) {
    let changed = false;
    for (const edge of edges) {
      const level = (levelOf.get(id(edge.source)) ?? 0) + 1;
      if (level > (levelOf.get(id(edge.target)) ?? 0)) {
        levelOf.set(id(edge.target), level);
        changed = true;
      }
    }
    if (!changed)
      break;
  }

  const children = new Map<string, LayoutNode[]>();
  const reached = new Set<string>();
  const roots: LayoutNode[] = [];

  const grow = (start: LayoutNode) => {
    roots.push(start);
    reached.add(start.id);
    const queue = [start];
    for (let index = 0; index < queue.length; index++) {
      const parent = queue[index];
      for (const targetId of outgoing.get(parent.id) ?? []) {
        const target = byId.get(targetId);
        if (!target || reached.has(targetId) || mergeIds.has(targetId))
          continue;
        reached.add(targetId);
        children.set(parent.id, [...(children.get(parent.id) ?? []), target]);
        queue.push(target);
      }
    }
  };

  nodes.filter(node => node.type === 'FACT').forEach(grow);
  nodes.forEach(node => {
    if (!reached.has(node.id) && !mergeIds.has(node.id) && !owned.has(node.id))
      grow(node);
  });
  merges.forEach(node => {
    if (!(incoming.get(node.id) ?? []).some(source => reached.has(source) || owned.has(source)))
      grow(node);
  });

  const placedMerges = new Set<string>();
  const trees: { root: LayoutNode; members: LayoutNode[] }[] = [];
  for (const root of roots) {
    const depths = new Map<string, number>();
    const positions = new Map<string, number>();
    let cursor = 0;
    let previousWidth = 0;
    let firstWidth = 0;
    let hasLeaf = false;

    const visit = (node: LayoutNode, depth: number) => {
      depths.set(node.id, depth);
      const kids = children.get(node.id) ?? [];
      if (kids.length === 0) {
        const width = labelWidth(node);
        if (hasLeaf)
          cursor += (previousWidth + width) / 2 + PADDING;
        else
          firstWidth = width;
        hasLeaf = true;
        previousWidth = width;
        positions.set(node.id, cursor);
        return;
      }
      kids.forEach(kid => visit(kid, depth + 1));
      positions.set(node.id, (positions.get(kids[0].id)! + positions.get(kids[kids.length - 1].id)!) / 2);
    };
    visit(root, 0);

    const treeMerges = merges.filter(node => !placedMerges.has(node.id)
      && (incoming.get(node.id) ?? []).some(source => depths.has(source)));
    treeMerges.forEach(node => placedMerges.add(node.id));
    const descendantsOf = (node: LayoutNode): LayoutNode[] =>
      (mergeChildren.get(node.id) ?? []).flatMap(kid => [kid, ...descendantsOf(kid)]);
    const mergeMembers = treeMerges.flatMap(node => [node, ...descendantsOf(node)]);

    const maxDepth = Math.max(...[...depths.keys(), ...mergeMembers.map(node => node.id)].map(nodeId => levelOf.get(nodeId) ?? 0));
    const branchCount = (children.get(root.id) ?? []).length;
    // few branches fan out in a partial arc instead of wrapping around the root
    const span = Math.min(2 * Math.PI, Math.max(1, branchCount) * ((2 * Math.PI) / 3));
    const isFullCircle = span >= 2 * Math.PI;
    const totalSpan = cursor + (previousWidth + firstWidth) / 2 + (isFullCircle ? PADDING : 2 * PADDING);
    const outerRadius = maxDepth === 0 ? 0 : Math.max(maxDepth * LEVEL_GAP, totalSpan / span);
    const ringRadius = (level: number) => maxDepth === 0 ? 0 : (level * outerRadius) / maxDepth;

    for (const nodeId of depths.keys()) {
      const node = byId.get(nodeId)!;
      const radius = ringRadius(levelOf.get(nodeId) ?? 0);
      const position = positions.get(nodeId) ?? 0;
      const angle = outerRadius === 0
        ? 0
        : isFullCircle
          ? (position / totalSpan) * span
          : ((cursor === 0 ? 0.5 : position / cursor) - 0.5) * (span - (2 * PADDING) / outerRadius);
      node.x = Math.cos(angle) * radius;
      node.y = Math.sin(angle) * radius;
    }

    const placeBeyond = (parent: LayoutNode, parentAngle: number) => {
      const kids = mergeChildren.get(parent.id) ?? [];
      kids.forEach((kid, index) => {
        const radius = ringRadius(levelOf.get(kid.id) ?? 0);
        const offset = radius === 0 ? 0 : ((index - (kids.length - 1) / 2) * (labelWidth(kid) + PADDING)) / radius;
        const angle = parentAngle + offset;
        kid.x = Math.cos(angle) * radius;
        kid.y = Math.sin(angle) * radius;
        placeBeyond(kid, angle);
      });
    };

    for (const merge of [...treeMerges].sort((a, b) => (levelOf.get(a.id) ?? 0) - (levelOf.get(b.id) ?? 0))) {
      const directions = (incoming.get(merge.id) ?? [])
        .filter(source => depths.has(source))
        .map(source => byId.get(source)!)
        .map(parent => {
          const length = Math.hypot(parent.x ?? 0, parent.y ?? 0) || 1;
          return {x: (parent.x ?? 0) / length, y: (parent.y ?? 0) / length};
        });
      let directionX = directions.reduce((sum, direction) => sum + direction.x, 0);
      let directionY = directions.reduce((sum, direction) => sum + direction.y, 0);
      const length = Math.hypot(directionX, directionY);
      if (length < 0.2 * directions.length) {
        directionX = directions[0].x;
        directionY = directions[0].y;
      } else {
        directionX /= length;
        directionY /= length;
      }
      const radius = ringRadius(levelOf.get(merge.id) ?? 0);
      merge.x = directionX * radius;
      merge.y = directionY * radius;
      placeBeyond(merge, Math.atan2(directionY, directionX));
    }

    trees.push({root, members: [...depths.keys()].map(nodeId => byId.get(nodeId)!).concat(mergeMembers)});
  }

  // several trees are arranged in a grid that roughly matches the aspect ratio of the canvas
  const boxes = trees.map(({members}) => ({
    left: Math.min(...members.map(node => (node.x ?? 0) - labelWidth(node) / 2)),
    right: Math.max(...members.map(node => (node.x ?? 0) + labelWidth(node) / 2)),
    top: Math.min(...members.map(node => (node.y ?? 0) - 40)),
    bottom: Math.max(...members.map(node => (node.y ?? 0) + 40))
  }));
  const columns = Math.max(1, Math.ceil(Math.sqrt(trees.length * 1.5)));
  const rows = Math.ceil(trees.length / columns);
  const columnWidths = Array.from({length: columns}, (_, column) => Math.max(0,
    ...boxes.filter((_, index) => index % columns === column).map(box => box.right - box.left)) + TREE_GAP);
  const rowHeights = Array.from({length: rows}, (_, row) => Math.max(0,
    ...boxes.filter((_, index) => Math.floor(index / columns) === row).map(box => box.bottom - box.top)) + TREE_GAP);

  trees.forEach(({root, members}, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const box = boxes[index];
    const offsetX = columnWidths.slice(0, column).reduce((sum, width) => sum + width, 0)
      + (columnWidths[column] - (box.right - box.left)) / 2 - box.left;
    const offsetY = rowHeights.slice(0, row).reduce((sum, height) => sum + height, 0)
      + (rowHeights[row] - (box.bottom - box.top)) / 2 - box.top;
    members.forEach(node => {
      node.x = (node.x ?? 0) + offsetX;
      node.y = (node.y ?? 0) + offsetY;
    });
    if (root.type === 'FACT') {
      root.fx = root.x;
      root.fy = root.y;
    }
  });
}

/**
 * Pushes nodes away from edges they do not belong to.
 */
function edgeAvoidanceForce(links: LayoutLink[]): Force<LayoutNode, LayoutLink> {
  let simulationNodes: LayoutNode[] = [];
  const force: Force<LayoutNode, LayoutLink> = (alpha: number) => {
    for (const link of links) {
      if (typeof link.source === 'string' || typeof link.target === 'string')
        continue;
      const sourceX = link.source.x ?? 0;
      const sourceY = link.source.y ?? 0;
      const deltaX = (link.target.x ?? 0) - sourceX;
      const deltaY = (link.target.y ?? 0) - sourceY;
      const lengthSquared = deltaX * deltaX + deltaY * deltaY;
      if (lengthSquared === 0)
        continue;

      for (const node of simulationNodes) {
        if (node === link.source || node === link.target)
          continue;
        const nodeX = node.x ?? 0;
        const nodeY = node.y ?? 0;
        const projection = Math.max(0, Math.min(1, ((nodeX - sourceX) * deltaX + (nodeY - sourceY) * deltaY) / lengthSquared));
        let offsetX = nodeX - (sourceX + projection * deltaX);
        let offsetY = nodeY - (sourceY + projection * deltaY);
        let distance = Math.hypot(offsetX, offsetY);
        const minimumDistance = collisionRadius(node);
        if (distance >= minimumDistance)
          continue;

        if (distance < 1) {
          const length = Math.sqrt(lengthSquared);
          const direction = node.id.charCodeAt(0) % 2 === 0 ? -1 : 1;
          offsetX = (-deltaY / length) * direction;
          offsetY = (deltaX / length) * direction;
          distance = 1;
        }

        const strength = (minimumDistance - distance) * alpha * 0.08 / distance;
        node.vx = (node.vx ?? 0) + offsetX * strength;
        node.vy = (node.vy ?? 0) + offsetY * strength;
      }
    }
  };
  force.initialize = nodes => simulationNodes = nodes;
  return force;
}

/**
 * Computes the layout. The returned simulation is stopped and already relaxed.
 */
export function createGraphLayout(nodes: LayoutNode[], links: LayoutLink[]): Simulation<LayoutNode, LayoutLink> {
  placeRadialTrees(nodes, links);

  const byId = new Map(nodes.map(node => [node.id, node]));
  const initialDistances = new Map<LayoutLink, number>(links.map(link => {
    const source = byId.get(link.source as string);
    const target = byId.get(link.target as string);
    const distance = Math.hypot((source?.x ?? 0) - (target?.x ?? 0), (source?.y ?? 0) - (target?.y ?? 0));
    return [link, distance || LEVEL_GAP];
  }));

  const simulation = forceSimulation<LayoutNode>(nodes)
    .force('link', forceLink<LayoutNode, LayoutLink>(links)
      .id(node => node.id)
      .distance(link => initialDistances.get(link) ?? LEVEL_GAP)
      .strength(0.25))
    .force('charge', forceManyBody<LayoutNode>().strength(-60))
    .force('collision', forceCollide<LayoutNode>().radius(collisionRadius).iterations(3))
    .force('edgeAvoidance', edgeAvoidanceForce(links));

  simulation.stop();
  simulation.alpha(0.4);
  simulation.tick(200);
  return simulation as unknown as Simulation<LayoutNode, LayoutLink>;
}
