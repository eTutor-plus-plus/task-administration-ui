import { isSelfLink, LayoutLink, LayoutNode, LEVEL_RADIUS, selfLoopShape, SHARED_RING_GAP } from './dfm-graph-layout';

interface Point {
  x: number;
  y: number;
}

const ARC_RADIUS = LEVEL_RADIUS + SHARED_RING_GAP;

/**
 * Draws at least a semicircle, covering all incoming directions with a small margin.
 */
export function crossArcPath(angles: number[]): string {
  const fullTurn = 2 * Math.PI;
  const sorted = angles.map(angle => (angle + fullTurn) % fullTurn).sort((a, b) => a - b);
  let start = -Math.PI;
  let span = Math.PI;
  if (sorted.length > 0) {
    let largestGap = -1;
    let first = 0;
    sorted.forEach((angle, index) => {
      const next = index + 1 < sorted.length ? sorted[index + 1] : sorted[0] + fullTurn;
      if (next - angle > largestGap) {
        largestGap = next - angle;
        first = (index + 1) % sorted.length;
      }
    });
    const covered = fullTurn - largestGap;
    span = Math.min(fullTurn, Math.max(Math.PI, covered + Math.PI / 12));
    start = sorted[first] - (span - covered) / 2;
  }
  const point = (angle: number) => `${ARC_RADIUS * Math.cos(angle)} ${ARC_RADIUS * Math.sin(angle)}`;
  return `M ${point(start)} A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${point(start + span / 2)}`
    + ` A ${ARC_RADIUS} ${ARC_RADIUS} 0 0 1 ${point(start + span)}`;
}

// Find the last intersection of a rendered edge with the circle around its target.
function incomingArcAngle(pointAt: (t: number) => Point, target: LayoutNode): number | undefined {
  const x = target.x ?? 0, y = target.y ?? 0;
  const distance = (t: number) => {
    const point = pointAt(t);
    return Math.hypot(point.x - x, point.y - y);
  };
  let inside = 1;
  if (distance(inside) > ARC_RADIUS)
    return undefined;
  for (let i = 1; i <= 64; i++) {
    let outside = 1 - i / 64;
    if (distance(outside) >= ARC_RADIUS) {
      for (let j = 0; j < 24; j++) {
        const middle = (outside + inside) / 2;
        if (distance(middle) >= ARC_RADIUS)
          outside = middle;
        else
          inside = middle;
      }
      const point = pointAt((outside + inside) / 2);
      return Math.atan2(point.y - y, point.x - x);
    }
    inside = outside;
  }
  return undefined;
}

/**
 * Returns the directions in which incoming edges cross the outer arc.
 */
export function incomingCrossAngles(target: LayoutNode, links: LayoutLink[]): number[] {
  const angles: number[] = [];
  for (const link of links) {
    if (typeof link.source === 'string' || typeof link.target === 'string' || link.target.id !== target.id)
      continue;

    const source = link.source;
    const sx = source.x ?? 0, sy = source.y ?? 0, tx = target.x ?? 0, ty = target.y ?? 0;
    const length = Math.hypot(tx - sx, ty - sy) || 1;
    const px = -(ty - sy) / length, py = (tx - sx) / length;
    const offsets = link.connectionType === 'MULTIPLE' && !isSelfLink(link) ? [2.5, -2.5] : [0];
    for (const offset of offsets) {
      let pointAt: (t: number) => Point;
      if (isSelfLink(link)) {
        const {start, first, second, end} = selfLoopShape(target, links, link.label, link.parallelOffset);
        pointAt = t => ({
          x: (1 - t) ** 3 * start.x + 3 * (1 - t) ** 2 * t * first.x + 3 * (1 - t) * t ** 2 * second.x + t ** 3 * end.x,
          y: (1 - t) ** 3 * start.y + 3 * (1 - t) ** 2 * t * first.y + 3 * (1 - t) * t ** 2 * second.y + t ** 3 * end.y
        });
      } else if (link.parallelOffset !== undefined) {
        const curveOffset = link.parallelOffset + offset;
        const cx = (sx + tx) / 2 + px * curveOffset * 2, cy = (sy + ty) / 2 + py * curveOffset * 2;
        pointAt = t => ({
          x: (1 - t) ** 2 * sx + 2 * (1 - t) * t * cx + t ** 2 * tx,
          y: (1 - t) ** 2 * sy + 2 * (1 - t) * t * cy + t ** 2 * ty
        });
      } else {
        pointAt = t => ({x: sx + (tx - sx) * t + px * offset, y: sy + (ty - sy) * t + py * offset});
      }
      const angle = incomingArcAngle(pointAt, target);
      if (angle === undefined)
        console.warn(`Could not find the incoming edge at cross attribute ${target.id}`);
      else
        angles.push(angle);
    }
  }
  return angles;
}
