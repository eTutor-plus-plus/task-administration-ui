import { crossArcPath, incomingCrossAngles } from './dfm-cross-arc';
import { LayoutLink, LayoutNode, selfLoopShape } from './dfm-graph-layout';

describe('cross-dimensional attribute arc', () => {
  const circle = Math.PI * 2;
  const node = (id: string, type: LayoutNode['type'], x: number, y: number): LayoutNode =>
    ({id, label: id, type, optional: false, details: [], x, y});
  const target = node('cross', 'CROSS', 0, 0);
  const link = (source: LayoutNode, connectionType = 'SIMPLE', parallelOffset?: number): LayoutLink =>
    ({source, target, connectionType, optional: false, parallelOffset});
  const normalize = (angle: number) => (angle + circle) % circle;

  function arcGeometry(path: string) {
    const parts = path.split(' ');
    const start = Math.atan2(Number(parts[2]), Number(parts[1]));
    const middle = Math.atan2(Number(parts[10]), Number(parts[9]));
    const end = Math.atan2(Number(parts[18]), Number(parts[17]));
    return {
      start,
      span: normalize(middle - start) + normalize(end - middle),
      radii: [1, 9, 17].map(index => Math.hypot(Number(parts[index]), Number(parts[index + 1])))
    };
  }

  it('centers a semicircle on the incoming edge', () => {
    const angles = incomingCrossAngles(target, [link(node('left', 'LEVEL', -100, 0))]);
    const arc = arcGeometry(crossArcPath(angles));

    expect(angles).toHaveLength(1);
    expect(angles[0]).toBeCloseTo(Math.PI, 5);
    expect(arc.span).toBeCloseTo(Math.PI, 5);
    expect(normalize(angles[0] - arc.start)).toBeCloseTo(Math.PI / 2, 5);
    arc.radii.forEach(radius => expect(radius).toBeCloseTo(14, 5));
  });

  it('extends the arc for incoming edges from more than a semicircle', () => {
    const directions = [0, 2 * Math.PI / 3, 4 * Math.PI / 3];
    const links = directions.map((angle, index) => link(node(`source${index}`, 'LEVEL',
      100 * Math.cos(angle), 100 * Math.sin(angle))));
    const angles = incomingCrossAngles(target, links);
    const arc = arcGeometry(crossArcPath(angles));

    expect(angles).toHaveLength(3);
    expect(arc.span).toBeGreaterThan(Math.PI);
    expect(arc.span).toBeLessThan(circle);
    angles.forEach(angle => expect(normalize(angle - arc.start)).toBeLessThan(arc.span));
  });

  it('uses the rendered geometry for parallel, multiple and recursive incoming edges', () => {
    const source = node('left', 'LEVEL', -100, 0);
    const curved = link(source, 'CONVERGENCE', 30);
    const multiple = link(source, 'MULTIPLE');
    const recursive = link(target, 'CONVERGENCE');
    const outgoing: LayoutLink = {source: target, target: source, connectionType: 'SIMPLE', optional: false};
    const links = [curved, multiple, recursive, outgoing];
    const angles = incomingCrossAngles(target, links);

    expect(angles).toHaveLength(4);
    expect(angles[0]).toBeLessThan(Math.PI - 0.1);
    expect(Math.abs(normalize(angles[1] - Math.PI + Math.PI) - Math.PI))
      .toBeCloseTo(Math.asin(2.5 / 14), 4);
    expect(Math.abs(normalize(angles[2] - Math.PI + Math.PI) - Math.PI))
      .toBeCloseTo(Math.asin(2.5 / 14), 4);
    expect(angles[1] * angles[2]).toBeLessThan(0);

    const {start, first, second, end} = selfLoopShape(target, links);
    let closest = {error: Infinity, angle: 0};
    for (let i = 5000; i <= 10000; i++) {
      const t = i / 10000;
      const x = (1 - t) ** 3 * start.x + 3 * (1 - t) ** 2 * t * first.x
        + 3 * (1 - t) * t ** 2 * second.x + t ** 3 * end.x;
      const y = (1 - t) ** 3 * start.y + 3 * (1 - t) ** 2 * t * first.y
        + 3 * (1 - t) * t ** 2 * second.y + t ** 3 * end.y;
      const error = Math.abs(Math.hypot(x, y) - 14);
      if (error < closest.error)
        closest = {error, angle: Math.atan2(y, x)};
    }
    expect(angles[3]).toBeCloseTo(closest.angle, 3);
    const arc = arcGeometry(crossArcPath(angles));
    angles.forEach(angle => expect(normalize(angle - arc.start)).toBeLessThan(arc.span));
  });
});
