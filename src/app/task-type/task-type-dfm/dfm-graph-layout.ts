import { DfmEdge, DfmGraph, DfmNode } from './dfm-graph.model';

export interface LayoutNode extends DfmNode {
  x?: number;
  y?: number;
}

export interface LayoutLink {
  source: string | LayoutNode;
  target: string | LayoutNode;
  connectionType: string;
  optional: boolean;
  label?: string | null;
  // distance by which the layout moved the description along the edge
  labelShift?: number;
}

export interface Bounds {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

const LEVEL_GAP = 90;
const TREE_GAP = 140;
export const MAX_FACT_WIDTH = 320;

/**
 * Approximate rendered width of a node including its label.
 */
export function labelWidth(node: DfmNode): number {
  if (node.type === 'FACT') {
    const longest = Math.max(node.label.length * 8, ...node.details.map(detail => detail.length * 6.5 + 20));
    return Math.min(MAX_FACT_WIDTH, Math.max(130, longest + 24));
  }
  if (node.type === 'DESCRIPTIVE')
    return Math.max(110, node.label.length * 6.6 + 12);
  return Math.max(44, node.label.length * 6.6 + 12);
}

function factHalfHeight(node: DfmNode): number {
  return (35 + node.details.length * 20) / 2;
}

export const SHARED_RING_GAP = 4;

/**
 * Whether the node is drawn as a circle: levels, shared hierarchies and cross-dimensional attributes.
 */
export function isCircleNode(node: DfmNode): boolean {
  return node.type === 'LEVEL' || node.type === 'SHARED' || node.type === 'CROSS';
}

/**
 * Approximate bounding box of a positioned node including its name.
 */
export function nodeBounds(node: LayoutNode, padding = 0): Bounds {
  const x = node.x ?? 0;
  const y = node.y ?? 0;
  let halfWidth = Math.max(LEVEL_RADIUS, node.label.length * 3.3 + 3);
  let top = -LEVEL_RADIUS;
  let bottom = 26;
  if (node.type === 'FACT') {
    halfWidth = Math.max(60, labelWidth(node) / 2);
    top = -factHalfHeight(node);
    bottom = factHalfHeight(node);
  } else if (node.type === 'DESCRIPTIVE') {
    halfWidth = Math.max(50, node.label.length * 3.3 + 3);
    bottom = 10;
  }
  return {left: x - halfWidth - padding, top: y + top - padding, right: x + halfWidth + padding, bottom: y + bottom + padding};
}

const SELF_LOOP_HEIGHT = 38;
const SELF_LOOP_HALF_WIDTH = 26;
const SELF_LOOP_HALF_GAP = 6;
const MAX_LOOP_CLEARANCE = 70 * Math.PI / 180;
const LEVEL_RADIUS = 10;
const LABEL_MARGIN = 9;
const LABEL_HALF_HEIGHT = 7;
const LABEL_CHAR_WIDTH = 6.6;
// room that an edge description is given around its text, so that it does not touch its neighbours
const LABEL_BOX_HALF_HEIGHT = 9;
const LABEL_BOX_PADDING = 3;

type LinkEnd = string | { id: string };

function endId(end: LinkEnd): string {
  return typeof end === 'string' ? end : end.id;
}

/**
 * A self-loop connects a level to itself (recursive hierarchy).
 */
export function isSelfLink(link: { source: LinkEnd; target: LinkEnd }): boolean {
  return endId(link.source) === endId(link.target);
}

export interface SelfLoopShape {
  path: string;
  labelX: number;
  labelY: number;
  bounds: Bounds;
}

/**
 * Geometry of a self-loop at a positioned node. The loop points upwards (the name of a level hangs below the node)
 * and as far away from the connected edges as possible.
 */
export function selfLoopShape(node: LayoutNode, links: LayoutLink[], label?: string | null): SelfLoopShape {
  const x = node.x ?? 0;
  const y = node.y ?? 0;

  const neighborAngles: number[] = [];
  for (const link of links) {
    if (isSelfLink(link) || typeof link.source === 'string' || typeof link.target === 'string')
      continue;
    const other = link.source === node ? link.target : link.target === node ? link.source : null;
    if (other)
      neighborAngles.push(Math.atan2((other.y ?? 0) - y, (other.x ?? 0) - x));
  }

  // among the upward directions the one with the largest angular distance to all connected edges wins;
  // without a clear difference the loop points straight up
  let bestAngle = -Math.PI / 2;
  let bestScore = -Infinity;
  for (let degrees = -150; degrees <= -30; degrees += 5) {
    const angle = degrees * Math.PI / 180;
    const clearance = Math.min(MAX_LOOP_CLEARANCE, ...neighborAngles.map(other => Math.abs(Math.atan2(Math.sin(angle - other), Math.cos(angle - other)))));
    const score = clearance - Math.abs(angle + Math.PI / 2) * 0.01;
    if (score > bestScore) {
      bestScore = score;
      bestAngle = angle;
    }
  }
  const dirX = Math.cos(bestAngle);
  const dirY = Math.sin(bestAngle);
  const perpX = -dirY;
  const perpY = dirX;

  const startAlong = Math.sqrt(LEVEL_RADIUS * LEVEL_RADIUS - SELF_LOOP_HALF_GAP * SELF_LOOP_HALF_GAP);
  const controlAlong = LEVEL_RADIUS + SELF_LOOP_HEIGHT;
  const point = (across: number, along: number) => ({x: x + perpX * across + dirX * along, y: y + perpY * across + dirY * along});
  const start = point(-SELF_LOOP_HALF_GAP, startAlong);
  const end = point(SELF_LOOP_HALF_GAP, startAlong);
  const first = point(-SELF_LOOP_HALF_WIDTH, controlAlong);
  const second = point(SELF_LOOP_HALF_WIDTH, controlAlong);
  const path = `M ${start.x} ${start.y} C ${first.x} ${first.y}, ${second.x} ${second.y}, ${end.x} ${end.y}`;

  const tip = 0.75 * controlAlong + 0.25 * startAlong;
  const halfWidth = (label?.length ?? 0) * LABEL_CHAR_WIDTH / 2;
  const extent = Math.abs(dirX) * halfWidth + Math.abs(dirY) * LABEL_HALF_HEIGHT;
  const labelCenter = point(0, tip + LABEL_MARGIN + extent);
  const labelHalfHeight = label ? LABEL_HALF_HEIGHT : 0;
  const xs = [start.x, end.x, first.x, second.x, labelCenter.x - halfWidth, labelCenter.x + halfWidth];
  const ys = [start.y, end.y, first.y, second.y, labelCenter.y - labelHalfHeight, labelCenter.y + labelHalfHeight];

  return {
    path,
    labelX: labelCenter.x,
    labelY: labelCenter.y,
    bounds: {left: Math.min(...xs), right: Math.max(...xs), top: Math.min(...ys), bottom: Math.max(...ys)}
  };
}

/**
 * Distance from the center of a node to its border in the direction (unitX, unitY).
 */
export function borderDistance(node: LayoutNode, unitX: number, unitY: number): number {
  if (node.type === 'SHARED')
    return LEVEL_RADIUS + SHARED_RING_GAP;
  if (isCircleNode(node))
    return LEVEL_RADIUS;
  const halfWidth = node.type === 'FACT' ? labelWidth(node) / 2 : 50;
  const halfHeight = node.type === 'FACT' ? factHalfHeight(node) : 10;
  const horizontal = Math.abs(unitX) < 1e-9 ? Infinity : halfWidth / Math.abs(unitX);
  const vertical = Math.abs(unitY) < 1e-9 ? Infinity : halfHeight / Math.abs(unitY);
  return Math.min(horizontal, vertical);
}

/**
 * Center of the description of an edge between two positioned nodes.
 * <p>
 * The description belongs to the visible part of the edge (between the node borders). Only optional and
 * convergence edges keep their middle free for the marker or arrow, so the description is shifted there towards
 * the lower node because node names hang below the nodes. If the edge is too short, the description is placed
 * beside the edge. The layout may have moved the description along its edge by {@code shift} to get it clear of
 * other edges; it always stays within the visible part.
 */
export function edgeLabelCenter(link: { label?: string | null; optional: boolean; connectionType: string; labelShift?: number },
                                source: LayoutNode, target: LayoutNode, shift = link.labelShift ?? 0): { x: number; y: number } {
  const sx = source.x ?? 0, sy = source.y ?? 0, tx = target.x ?? 0, ty = target.y ?? 0;
  const length = Math.hypot(tx - sx, ty - sy) || 1;
  const unitX = (tx - sx) / length, unitY = (ty - sy) / length;
  const px = -unitY, py = unitX;
  const startClip = borderDistance(source, unitX, unitY);
  const endClip = borderDistance(target, -unitX, -unitY);
  const visibleLength = length - startClip - endClip;
  const visibleMiddleX = (sx + tx) / 2 + unitX * (startClip - endClip) / 2;
  const visibleMiddleY = (sy + ty) / 2 + unitY * (startClip - endClip) / 2;
  const labelHalfWidth = (link.label?.length ?? 0) * LABEL_CHAR_WIDTH / 2;
  const dirX = ty < sy ? -unitX : unitX, dirY = Math.abs(unitY);
  const extent = Math.abs(dirX) * labelHalfWidth + Math.abs(dirY) * LABEL_HALF_HEIGHT;
  const reserveMiddle = link.optional || link.connectionType === 'CONVERGENCE';
  if (reserveMiddle ? LABEL_MARGIN + 2 * extent + 2 > visibleLength / 2 : 2 * extent + 2 > visibleLength) {
    const side = py > 0 ? -1 : 1;
    const offset = LABEL_MARGIN + Math.abs(px) * labelHalfWidth + Math.abs(py) * LABEL_HALF_HEIGHT;
    return {x: visibleMiddleX + px * side * offset, y: visibleMiddleY + py * side * offset};
  }
  // position along the edge, measured from the center of the source
  const middle = (startClip + length - endClip) / 2;
  const towardsLower = ty < sy ? -1 : 1;
  let along = (reserveMiddle ? middle + towardsLower * (extent + LABEL_MARGIN) : middle) + shift;
  along = Math.min(length - endClip - extent - 1, Math.max(startClip + extent + 1, along));
  if (reserveMiddle && towardsLower * (along - middle) < extent + LABEL_MARGIN)
    along = middle + towardsLower * (extent + LABEL_MARGIN);
  return {x: sx + unitX * along, y: sy + unitY * along};
}

/**
 * Area that an edge description occupies around its center, including some room around the text.
 */
export function edgeLabelBounds(label: string, center: { x: number; y: number }): Bounds {
  const halfWidth = label.length * LABEL_CHAR_WIDTH / 2 + LABEL_BOX_PADDING;
  return {left: center.x - halfWidth, right: center.x + halfWidth, top: center.y - LABEL_BOX_HALF_HEIGHT, bottom: center.y + LABEL_BOX_HALF_HEIGHT};
}

export function graphBounds(nodes: LayoutNode[], links: LayoutLink[] = []): Bounds {
  const boxes = nodes.map(nodeBounds);
  for (const link of links) {
    if (!isSelfLink(link))
      continue;
    const node = typeof link.source === 'string' ? nodes.find(candidate => candidate.id === link.source) : link.source;
    if (node)
      boxes.push(selfLoopShape(node, links, link.label).bounds);
  }
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

const ROOT_GAP = 60;
const MAX_GAP = 420;
const NODE_SPACING = 16;
// widest fan of children in front of a node; keeps the edges of a fan from running along their neighbours
const MAX_FAN = 150 * Math.PI / 180;
const MAX_EXTRA_ROOM = 192;
const REPAIR_PASSES = 80;

interface TreeEdge {
  source: string;
  target: string;
  connectionType: string;
  optional: boolean;
  label?: string | null;
  // the link that the layout result (the shift of the description) is written to
  link: LayoutLink;
}

function expand(bounds: Bounds, padding: number): Bounds {
  return {left: bounds.left - padding, top: bounds.top - padding, right: bounds.right + padding, bottom: bounds.bottom + padding};
}

function intersects(first: Bounds, second: Bounds): boolean {
  return first.left < second.right && first.right > second.left && first.top < second.bottom && first.bottom > second.top;
}

function segmentCrossesBox(x1: number, y1: number, x2: number, y2: number, box: Bounds): boolean {
  const deltaX = x2 - x1;
  const deltaY = y2 - y1;
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
  return clip(-deltaX, x1 - box.left) && clip(deltaX, box.right - x1) && clip(-deltaY, y1 - box.top) && clip(deltaY, box.bottom - y1)
    && maximum > minimum;
}

/**
 * Places every tree around its root (a fact, or the head of a dimension without a fact).
 * <p>
 * Each child of the root gets its own sector, so the dimensions of a fact surround it. Inside a sector every node
 * gets the angular width that its subtree needs at its own distance from the root, and children are centered in
 * front of their parent. Subtrees therefore stay together and cannot run into each other. The length of an edge is
 * decided per edge: it starts with a default and grows only where a description, a wide name, a recursive hierarchy
 * or a broad fan needs more room. The layout is then checked and the responsible edges are lengthened until nothing
 * overlaps; there is no simulation, so the same model always yields the same picture. Descriptions that only meet
 * another edge slide along their own edge instead; the result is stored in {@code labelShift} of the link.
 *
 * @param nodes The nodes to position.
 * @param links All links with resolved ends, including the self-loops of recursive hierarchies.
 */
export function placeTrees(nodes: LayoutNode[], links: LayoutLink[]): void {
  const byId = new Map(nodes.map(node => [node.id, node]));
  // self-loops (recursive hierarchies) are not part of the tree structure
  const edges: TreeEdge[] = links
    .filter(link => !isSelfLink(link))
    .map(link => ({...link, source: endId(link.source), target: endId(link.target), link}))
    .filter(edge => byId.has(edge.source) && byId.has(edge.target));
  const loops = links.filter(link => isSelfLink(link) && byId.has(endId(link.source)));
  const loopsAt = new Map<string, LayoutLink[]>();
  loops.forEach(loop => loopsAt.set(endId(loop.source), [...(loopsAt.get(endId(loop.source)) ?? []), loop]));
  const outgoing = new Map<string, TreeEdge[]>();
  const incoming = new Map<string, TreeEdge[]>();
  edges.forEach(edge => {
    outgoing.set(edge.source, [...(outgoing.get(edge.source) ?? []), edge]);
    incoming.set(edge.target, [...(incoming.get(edge.target) ?? []), edge]);
  });
  // descriptions that the layout moved along their edge, see edgeLabelCenter
  const labelShifts = new Map<TreeEdge, number>();
  const shiftOf = (edge: TreeEdge) => labelShifts.get(edge) ?? 0;

  // longest path from a root; a node always lies further out than all of its parents
  const levelOf = new Map<string, number>(nodes.map(node => [node.id, 0]));
  for (let pass = 0; pass < nodes.length; pass++) {
    let changed = false;
    for (const edge of edges) {
      const next = (levelOf.get(edge.source) ?? 0) + 1;
      if (next > (levelOf.get(edge.target) ?? 0)) {
        levelOf.set(edge.target, next);
        changed = true;
      }
    }
    if (!changed)
      break;
  }
  const level = (nodeId: string) => levelOf.get(nodeId) ?? 0;

  // The tree decides the order of the nodes around the root. Nodes with several parents (e.g. a year reached from
  // month and calendar week) are added afterwards, see attachMerge.
  const treeParent = new Map<string, string>();
  const treeChildren = new Map<string, string[]>();
  const reached = new Set<string>();
  const roots: LayoutNode[] = [];
  const kidsOf = (nodeId: string) => treeChildren.get(nodeId) ?? [];
  const isMerge = (nodeId: string) => byId.get(nodeId)!.type !== 'FACT'
    && new Set((incoming.get(nodeId) ?? []).map(edge => edge.source)).size > 1;
  const attach = (parent: string, child: string) => {
    treeParent.set(child, parent);
    treeChildren.set(parent, [...kidsOf(parent), child]);
  };
  const grow = (start: string) => {
    reached.add(start);
    const queue = [start];
    for (let index = 0; index < queue.length; index++) {
      for (const edge of outgoing.get(queue[index]) ?? []) {
        if (reached.has(edge.target) || isMerge(edge.target))
          continue;
        reached.add(edge.target);
        attach(queue[index], edge.target);
        queue.push(edge.target);
      }
    }
  };
  // the node itself, its tree parent, ... up to the root
  const pathToRoot = (nodeId: string) => {
    const path = [nodeId];
    while (treeParent.has(path[path.length - 1]) && path.length <= nodes.length)
      path.push(treeParent.get(path[path.length - 1])!);
    return path;
  };
  const moveToEdge = (nodeId: string, toEnd: boolean) => {
    const parent = treeParent.get(nodeId);
    if (!parent)
      return;
    const others = kidsOf(parent).filter(kid => kid !== nodeId);
    treeChildren.set(parent, toEnd ? [...others, nodeId] : [nodeId, ...others]);
  };

  // A node with several parents is placed between the branches of its parents: it becomes a child of their lowest
  // common ancestor in the order around the root, while its distance still follows its real parents. The parents are
  // turned towards it, so the additional edges stay short and do not cross their branches.
  const attachMerge = (merge: string) => {
    const parents = [...new Set((incoming.get(merge) ?? []).map(edge => edge.source))].filter(parent => reached.has(parent));
    reached.add(merge);
    const paths = parents.map(pathToRoot);
    const anchor = paths[0].find(candidate => paths.every(path => path.includes(candidate)));
    if (parents.length === 1 || !anchor) {
      attach(parents[0], merge);
      grow(merge);
      return;
    }

    const branchOf = (path: string[]) => {
      const index = path.indexOf(anchor);
      return index > 0 ? path[index - 1] : null;
    };
    const anchorKids = kidsOf(anchor);
    const branches = [...new Set(paths.map(branchOf).filter((branch): branch is string => branch !== null))]
      .sort((first, second) => anchorKids.indexOf(first) - anchorKids.indexOf(second));
    const firstIndex = anchorKids.indexOf(branches[0]);
    const before = anchorKids.filter((kid, index) => index < firstIndex && !branches.includes(kid));
    const after = anchorKids.filter((kid, index) => index > firstIndex && !branches.includes(kid));

    // with an odd number of sibling branches the node continues the middle branch, otherwise it sits in the gap
    // between the two halves
    const continuesMiddle = !parents.includes(anchor) && branches.length % 2 === 1;
    const split = continuesMiddle ? (branches.length - 1) / 2 : Math.ceil(branches.length / 2);
    const middleParent = continuesMiddle ? parents[paths.findIndex(path => branchOf(path) === branches[split])] : null;
    if (continuesMiddle) {
      treeChildren.set(anchor, [...before, ...branches, ...after]);
    } else {
      treeParent.set(merge, anchor);
      treeChildren.set(anchor, [...before, ...branches.slice(0, split), merge, ...branches.slice(split), ...after]);
    }
    parents.forEach((parent, index) => {
      const branch = branchOf(paths[index]);
      if (!branch)
        return;
      const position = branches.indexOf(branch);
      if (continuesMiddle && position === split)
        return;
      for (let node = parent; node !== branch && treeParent.has(node); node = treeParent.get(node)!)
        moveToEdge(node, position < split);
    });
    if (middleParent)
      attach(middleParent, merge);
    grow(merge);
  };

  nodes.filter(node => node.type === 'FACT').forEach(node => {
    roots.push(node);
    grow(node.id);
  });
  nodes.forEach(node => {
    if (reached.has(node.id) || (incoming.get(node.id)?.length ?? 0) > 0)
      return;
    roots.push(node);
    grow(node.id);
  });
  const merges = nodes.filter(node => isMerge(node.id)).sort((first, second) => level(first.id) - level(second.id));
  for (let guard = 0; guard <= nodes.length; guard++) {
    const merge = merges.find(node => !reached.has(node.id)
      && (incoming.get(node.id) ?? []).some(edge => reached.has(edge.source)));
    if (merge) {
      attachMerge(merge.id);
      continue;
    }
    // only reachable through a cycle
    const rest = nodes.find(node => !reached.has(node.id));
    if (!rest)
      break;
    roots.push(rest);
    grow(rest.id);
  }

  const trees = roots.map(root => {
    const members: LayoutNode[] = [];
    const collect = (nodeId: string) => {
      members.push(byId.get(nodeId)!);
      kidsOf(nodeId).forEach(collect);
    };
    collect(root.id);
    const inTree = new Set(members.map(node => node.id));
    const byLevel = [...members].sort((first, second) => level(first.id) - level(second.id));
    const treeEdges = edges.filter(edge => inTree.has(edge.source) && inTree.has(edge.target));
    const treeLoops = loops.filter(loop => inTree.has(endId(loop.source)));

    const gaps = new Map<string, number>();
    const minimumLengths = new Map<TreeEdge, number>();
    // room to the sides that a description asked for because something else was in its way, per edge
    const extraRoom = new Map<TreeEdge, number>();
    const radius = new Map<string, number>();
    const angle = new Map<string, number>();
    const width = new Map<string, number>();
    // room to the sides that the loop of a recursive hierarchy asked for, per level
    const loopRoom = new Map<string, number>();
    // all edges leaving a node share one length, so its children form an arc; single edges may be longer
    const gapOf = (source: string) => gaps.get(source) ?? (source === root.id ? ROOT_GAP : LEVEL_GAP);
    const lengthOf = (edge: TreeEdge) => Math.max(gapOf(edge.source), minimumLengths.get(edge) ?? 0);
    // gap in the middle of the children of a level with a recursive hierarchy, so that its loop fits between them
    const loopGaps = new Map<string, number>();
    const loopWindowOf = (nodeId: string) => {
      const gap = loopGaps.get(nodeId) ?? 0;
      const kids = kidsOf(nodeId);
      if (gap === 0 || kids.length === 0)
        return 0;
      return gap / (Math.min(...kids.map(kid => radius.get(kid) ?? 0)) || 1);
    };
    const fanOf = (nodeId: string) => kidsOf(nodeId).reduce((sum, kid) => sum + (width.get(kid) ?? 0), 0) + loopWindowOf(nodeId);

    const place = () => {
      for (const node of byLevel) {
        if (node === root) {
          radius.set(node.id, 0);
          continue;
        }
        // the root is a box, so its children start at its border in their direction
        const direction = angle.get(node.id) ?? Math.PI / 4;
        let distance = 0;
        for (const edge of incoming.get(node.id) ?? []) {
          if (!inTree.has(edge.source) || level(edge.source) >= level(node.id))
            continue;
          const start = edge.source === root.id
            ? borderDistance(root, Math.cos(direction), Math.sin(direction))
            : radius.get(edge.source) ?? 0;
          distance = Math.max(distance, start + lengthOf(edge));
        }
        radius.set(node.id, distance || (radius.get(treeParent.get(node.id) ?? '') ?? 0) + LEVEL_GAP);
      }

      // angular width of every subtree: its own room at its distance, or the widths of its children
      const measure = (nodeId: string): number => {
        const node = byId.get(nodeId)!;
        let own = 0;
        if (node !== root) {
          const box = nodeBounds({...node, x: 0, y: 0});
          const direction = angle.get(nodeId);
          let extent = direction === undefined
            ? box.right - box.left
            : (box.right - box.left) * Math.abs(Math.sin(direction)) + (box.bottom - box.top) * Math.abs(Math.cos(direction));
          // a recursive hierarchy needs room for its loop and role next to the level
          for (const loop of loopsAt.get(nodeId) ?? [])
            extent = Math.max(extent, 2 * SELF_LOOP_HALF_WIDTH + 2 * LABEL_MARGIN, (loop.label?.length ?? 0) * LABEL_CHAR_WIDTH + 2 * LABEL_MARGIN);
          // room that labels and loops asked for because something else was in their way
          const room = (incoming.get(nodeId) ?? []).reduce((sum, edge) => sum + (extraRoom.get(edge) ?? 0), 0)
            + (loopRoom.get(nodeId) ?? 0);
          own = 2 * Math.atan((extent + NODE_SPACING + room) / 2 / (radius.get(nodeId) || 1));
          // a description sits on the edge from the parent and must not reach into the neighbours
          const parent = treeParent.get(nodeId);
          const described = (incoming.get(nodeId) ?? []).find(edge => edge.source === parent && edge.label);
          if (parent && described) {
            const textWidth = described.label!.length * LABEL_CHAR_WIDTH + 6;
            const labelExtent = direction === undefined
              ? textWidth
              : textWidth * Math.abs(Math.sin(direction)) + 2 * LABEL_BOX_HALF_HEIGHT * Math.abs(Math.cos(direction));
            let distance = ((radius.get(parent) ?? 0) + (radius.get(nodeId) ?? 0)) / 2;
            if (node.x !== undefined) {
              const center = edgeLabelCenter(described, byId.get(parent)!, node, shiftOf(described));
              distance = Math.hypot(center.x, center.y);
            }
            own = Math.max(own, 2 * Math.atan((labelExtent + 10 + room) / 2 / (distance || 1)));
          }
        }
        const result = Math.max(own, kidsOf(nodeId).reduce((sum, kid) => sum + measure(kid), 0) + loopWindowOf(nodeId));
        width.set(nodeId, result);
        return result;
      };
      const total = measure(root.id);

      const assign = (nodeId: string, center: number) => {
        angle.set(nodeId, center);
        const kids = kidsOf(nodeId);
        let start = center - fanOf(nodeId) / 2;
        kids.forEach((kid, index) => {
          if (index === Math.ceil(kids.length / 2))
            start += loopWindowOf(nodeId);
          const kidWidth = width.get(kid) ?? 0;
          assign(kid, start + kidWidth / 2);
          start += kidWidth;
        });
      };
      // the room that is left around the root is shared equally between its children
      const kids = kidsOf(root.id);
      const squeeze = total > 2 * Math.PI ? (2 * Math.PI) / total : 1;
      const slack = Math.max(0, 2 * Math.PI - total) / Math.max(1, kids.length);
      let cursor = kids.length > 0 ? -((width.get(kids[0]) ?? 0) * squeeze + slack) / 2 : 0;
      for (const kid of kids) {
        const sector = (width.get(kid) ?? 0) * squeeze + slack;
        assign(kid, cursor + sector / 2);
        cursor += sector;
      }

      for (const node of members) {
        const distance = radius.get(node.id) ?? 0;
        const direction = angle.get(node.id) ?? 0;
        node.x = Math.cos(direction) * distance;
        node.y = Math.sin(direction) * distance;
      }
      return total;
    };

    // finds what is still in the way and makes room for it; returns whether anything changed
    const repair = (total: number) => {
      const crowded = new Set<string>();
      const cramped = new Set<TreeEdge>();
      const blocked = new Set<TreeEdge>();
      let changed = false;
      if (total > 2 * Math.PI)
        crowded.add(root.id);
      for (const node of members) {
        if (node !== root && fanOf(node.id) > MAX_FAN)
          crowded.add(node.id);
      }

      const boxes = new Map(members.map(node => [node.id, nodeBounds(node, 3)]));
      members.forEach((first, index) => members.slice(index + 1).forEach(second => {
        if (!intersects(boxes.get(first.id)!, boxes.get(second.id)!))
          return;
        const outer = (radius.get(first.id) ?? 0) >= (radius.get(second.id) ?? 0) ? first : second;
        for (const edge of incoming.get(outer.id) ?? []) {
          if (inTree.has(edge.source))
            crowded.add(edge.source);
        }
      }));

      const labelBox = (edge: TreeEdge, shift: number) =>
        edgeLabelBounds(edge.label!, edgeLabelCenter(edge, byId.get(edge.source)!, byId.get(edge.target)!, shift));
      const labels = treeEdges.filter(edge => edge.label).map(edge => ({edge, box: labelBox(edge, shiftOf(edge))}));
      const crossing = (edge: TreeEdge, box: Bounds) => {
        const source = byId.get(edge.source)!;
        const target = byId.get(edge.target)!;
        return segmentCrossesBox(source.x ?? 0, source.y ?? 0, target.x ?? 0, target.y ?? 0, box);
      };
      for (const edge of treeEdges) {
        const source = byId.get(edge.source)!;
        const target = byId.get(edge.target)!;
        if (members.some(node => node !== source && node !== target && crossing(edge, nodeBounds(node, 4))))
          crowded.add(edge.source);
        // an edge starts and ends below the names of its own nodes, but most of it must be clear of them
        const middleX = ((source.x ?? 0) + (target.x ?? 0)) / 2;
        const middleY = ((source.y ?? 0) + (target.y ?? 0)) / 2;
        if (segmentCrossesBox(middleX, middleY, target.x ?? 0, target.y ?? 0, nodeBounds(source))
          || segmentCrossesBox(source.x ?? 0, source.y ?? 0, middleX, middleY, nodeBounds(target)))
          crowded.add(edge.source);
        for (const label of labels) {
          if (label.edge !== edge && crossing(edge, label.box))
            blocked.add(label.edge);
        }
      }
      // The two lines of a double edge leave a level side by side and meet the lines of a neighbouring edge right
      // there. With a small angle between the two edges that crossing would lie outside the level.
      treeEdges.forEach((first, index) => treeEdges.slice(index + 1).forEach(second => {
        const shared = [first.source, first.target].find(nodeId => nodeId === second.source || nodeId === second.target);
        const offset = (first.connectionType === 'MULTIPLE' ? 2.5 : 0) + (second.connectionType === 'MULTIPLE' ? 2.5 : 0);
        if (!shared || offset === 0 || !isCircleNode(byId.get(shared)!))
          return;
        const from = byId.get(shared)!;
        const direction = (edge: TreeEdge) => {
          const to = byId.get(edge.source === shared ? edge.target : edge.source)!;
          return Math.atan2((to.y ?? 0) - (from.y ?? 0), (to.x ?? 0) - (from.x ?? 0));
        };
        const between = direction(first) - direction(second);
        if (Math.cos(between) > 0 && offset > LEVEL_RADIUS * Math.abs(Math.sin(between))) {
          blocked.add(first);
          blocked.add(second);
        }
      }));
      labels.forEach((label, index) => {
        for (const node of members) {
          if (!intersects(label.box, nodeBounds(node, 1)))
            continue;
          if (node.id === label.edge.source || node.id === label.edge.target)
            cramped.add(label.edge);
          else
            blocked.add(label.edge);
        }
        for (const other of labels.slice(index + 1)) {
          if (!intersects(label.box, other.box))
            continue;
          blocked.add(label.edge);
          blocked.add(other.edge);
        }
      });

      // A recursive hierarchy must keep its loop and role clear of everything else. The loop points away from the
      // edges of its level, so the level needs room to the sides and some distance from its parent. If the children
      // fan out upwards, the role would lie on their edges, so a gap is left between them for the loop.
      for (const loop of treeLoops) {
        const node = loop.source as LayoutNode;
        const shape = selfLoopShape(node, links, loop.label);
        if (loop.label && kidsOf(node.id).length > 0) {
          const role = edgeLabelBounds(loop.label, {x: shape.labelX, y: shape.labelY});
          if (treeEdges.some(edge => (edge.source === node.id || edge.target === node.id) && crossing(edge, role))
            && (loopGaps.get(node.id) ?? 0) < MAX_EXTRA_ROOM) {
            loopGaps.set(node.id, (loopGaps.get(node.id) ?? 0) + 16);
            changed = true;
          }
        }
        const area = expand(shape.bounds, 2);
        const inTheWay = members.some(other => other !== node && intersects(area, nodeBounds(other)))
          || labels.some(label => intersects(area, label.box))
          || treeEdges.some(edge => edge.source !== node.id && edge.target !== node.id && crossing(edge, area))
          || treeLoops.some(other => other.source !== node && intersects(area, selfLoopShape(other.source as LayoutNode, links, other.label).bounds));
        if (!inTheWay)
          continue;
        if ((loopRoom.get(node.id) ?? 0) < MAX_EXTRA_ROOM) {
          loopRoom.set(node.id, (loopRoom.get(node.id) ?? 0) + 16);
          changed = true;
        }
        for (const edge of incoming.get(node.id) ?? []) {
          if (inTree.has(edge.source))
            cramped.add(edge);
        }
        if (kidsOf(node.id).length > 0)
          crowded.add(node.id);
      }

      // A description that only meets something else (e.g. an edge that joins a node from another branch) first
      // slides along its edge to a free place. Otherwise a longer edge always helps against its own ends, and it lets
      // a description that had to move beside its edge return onto it. A description on its edge gets more room to
      // the sides as a last resort; that may not help, so it is limited.
      const isFree = (edge: TreeEdge, box: Bounds) =>
        !treeEdges.some(other => other !== edge && crossing(other, box))
        && !members.some(node => intersects(box, nodeBounds(node, 1)))
        && !labels.some(label => label.edge !== edge && intersects(box, label.box))
        && !treeLoops.some(loop => intersects(box, selfLoopShape(loop.source as LayoutNode, links, loop.label).bounds));
      const slide = (edge: TreeEdge) => {
        const current = labelBox(edge, shiftOf(edge));
        const source = byId.get(edge.source)!;
        const target = byId.get(edge.target)!;
        const length = Math.hypot((target.x ?? 0) - (source.x ?? 0), (target.y ?? 0) - (source.y ?? 0));
        for (let distance = 12; distance <= length; distance += 12) {
          for (const shift of [distance, -distance]) {
            const box = labelBox(edge, shift);
            if (Math.abs(box.left - current.left) < 0.5 && Math.abs(box.top - current.top) < 0.5)
              continue;
            if (isFree(edge, box)) {
              labelShifts.set(edge, shift);
              return true;
            }
          }
        }
        return false;
      };
      for (const edge of blocked) {
        if (cramped.has(edge))
          continue;
        const source = byId.get(edge.source)!;
        const target = byId.get(edge.target)!;
        const center = edgeLabelCenter(edge, source, target, shiftOf(edge));
        const deltaX = (target.x ?? 0) - (source.x ?? 0);
        const deltaY = (target.y ?? 0) - (source.y ?? 0);
        const besideEdge = Math.abs((center.x - (source.x ?? 0)) * deltaY - (center.y - (source.y ?? 0)) * deltaX)
          / (Math.hypot(deltaX, deltaY) || 1) > 1;
        if (besideEdge)
          cramped.add(edge);
        else if (edge.label && slide(edge))
          changed = true;
        else if ((extraRoom.get(edge) ?? 0) < MAX_EXTRA_ROOM) {
          extraRoom.set(edge, (extraRoom.get(edge) ?? 0) + 16);
          changed = true;
        }
      }

      for (const source of crowded) {
        const current = gapOf(source);
        if (current >= MAX_GAP)
          continue;
        gaps.set(source, Math.min(MAX_GAP, current * 1.12 + 6));
        changed = true;
      }
      for (const edge of cramped) {
        const current = lengthOf(edge);
        if (current >= MAX_GAP)
          continue;
        minimumLengths.set(edge, Math.min(MAX_GAP, current + 14));
        changed = true;
      }
      return changed;
    };

    // the first passes only settle the directions, which the distances from the root box depend on
    for (let pass = 0; pass < REPAIR_PASSES; pass++) {
      const total = place();
      if (!repair(total) && pass >= 2)
        break;
    }
    const loopBounds = treeLoops.map(loop => selfLoopShape(loop.source as LayoutNode, links, loop.label).bounds);
    return {members, loopBounds};
  });
  edges.forEach(edge => edge.link.labelShift = shiftOf(edge));

  // several trees are arranged in a grid that roughly matches the aspect ratio of the canvas
  const boxes = trees.map(({members, loopBounds}) => ({
    left: Math.min(...members.map(node => (node.x ?? 0) - labelWidth(node) / 2), ...loopBounds.map(box => box.left)),
    right: Math.max(...members.map(node => (node.x ?? 0) + labelWidth(node) / 2), ...loopBounds.map(box => box.right)),
    top: Math.min(...members.map(node => (node.y ?? 0) - 40), ...loopBounds.map(box => box.top)),
    bottom: Math.max(...members.map(node => (node.y ?? 0) + 40), ...loopBounds.map(box => box.bottom))
  }));
  const columns = Math.max(1, Math.ceil(Math.sqrt(trees.length * 1.5)));
  const rows = Math.ceil(trees.length / columns);
  const columnWidths = Array.from({length: columns}, (_, column) => Math.max(0,
    ...boxes.filter((_, index) => index % columns === column).map(box => box.right - box.left)) + TREE_GAP);
  const rowHeights = Array.from({length: rows}, (_, row) => Math.max(0,
    ...boxes.filter((_, index) => Math.floor(index / columns) === row).map(box => box.bottom - box.top)) + TREE_GAP);

  trees.forEach(({members}, index) => {
    const column = index % columns;
    const row = Math.floor(index / columns);
    const box = boxes[index];
    const offsetX = columnWidths.slice(0, column).reduce((sum, columnWidth) => sum + columnWidth, 0)
      + (columnWidths[column] - (box.right - box.left)) / 2 - box.left;
    const offsetY = rowHeights.slice(0, row).reduce((sum, rowHeight) => sum + rowHeight, 0)
      + (rowHeights[row] - (box.bottom - box.top)) / 2 - box.top;
    members.forEach(node => {
      node.x = (node.x ?? 0) + offsetX;
      node.y = (node.y ?? 0) + offsetY;
    });
  });
}

/**
 * Computes the layout: resolves the ends of all links to their nodes and positions the nodes. The diagram is
 * static, so the layout is computed once.
 */
export function createGraphLayout(nodes: LayoutNode[], links: LayoutLink[]): void {
  const byId = new Map(nodes.map(node => [node.id, node]));
  for (const link of links) {
    const source = byId.get(endId(link.source));
    const target = byId.get(endId(link.target));
    if (source)
      link.source = source;
    if (target)
      link.target = target;
  }
  placeTrees(nodes, links.filter(link => typeof link.source !== 'string' && typeof link.target !== 'string'));
}
