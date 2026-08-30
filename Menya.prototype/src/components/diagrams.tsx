import type {
  DiagramSpec, GraphDiagram, NumberLineDiagram, FactorTreeDiagram, BarChartDiagram,
  ShapeDiagram, RatioBarDiagram, BalanceScaleDiagram, StepSequenceDiagram, UnitCircleDiagram,
} from "../types";

// Every visual here is a small, parameterized inline SVG generated from plain numbers —
// no external images, so nothing to fetch, host, or break. Colors follow the app's
// existing chart palette (#2F4F4F primary, #708090 accent, slate greys for axes/grid).

const PRIMARY = "#2F4F4F";
const ACCENT = "#708090";
const GRID = "#e2e8f0";
const AXIS = "#94a3b8";
const TEXT = "#334155";
const MUTED_TEXT = "#64748b";

// ── Function graphs (linear, quadratic, cubic, exponential, log, rational, piecewise, trig) ──

function evalFamily(spec: GraphDiagram, x: number): number | undefined {
  switch (spec.family) {
    case "linear":
    case "linear-inequality":
    case "linear-system":
      return (spec.m ?? 1) * x + (spec.b ?? 0);
    case "quadratic":
      return (spec.a ?? 1) * x * x + (spec.bq ?? 0) * x + (spec.c ?? 0);
    case "cubic": {
      const roots = spec.roots ?? [-1, 0, 1];
      return roots.reduce((acc, r) => acc * (x - r), 1);
    }
    case "exponential":
      return Math.pow(spec.base ?? 2, x);
    case "log":
      return x > 0 ? Math.log(x) / Math.log(spec.base ?? Math.E) : undefined;
    case "rational": {
      const asym = spec.asymptoteX ?? 0;
      if (Math.abs(x - asym) < 0.2) return undefined;
      return 1 / (x - asym);
    }
    case "piecewise": {
      const piece = (spec.pieces ?? []).find((p) => x >= p.from && x <= p.to);
      return piece ? piece.m * x + piece.b : undefined;
    }
    case "trig":
      return (spec.amplitude ?? 1) * Math.sin(((2 * Math.PI) / (spec.period ?? 2 * Math.PI)) * x);
    default:
      return undefined;
  }
}

function FunctionGraphSVG({ spec }: { spec: GraphDiagram }) {
  const W = 300, H = 190, PAD = 26;
  const [xMin, xMax] = spec.domain ?? [-6, 6];
  const N = 140;
  const xs: number[] = [];
  for (let i = 0; i <= N; i++) xs.push(xMin + (i / N) * (xMax - xMin));

  const ys = xs.map((x) => evalFamily(spec, x)).filter((y): y is number => y !== undefined && Number.isFinite(y));
  const ys2 = spec.family === "linear-system" ? xs.map((x) => (spec.m2 ?? -1) * x + (spec.b2 ?? 0)) : [];
  const markY = (spec.markPoints ?? []).map((p) => p.y);
  const domainSpan = xMax - xMin;
  const clamp = domainSpan * 1.8;
  const allY = [0, ...ys, ...ys2, ...markY].filter((y) => Math.abs(y) <= clamp);
  let yMin = Math.min(...allY), yMax = Math.max(...allY);
  if (yMax - yMin < 1) { yMax += 2; yMin -= 2; }
  const padY = (yMax - yMin) * 0.15;
  yMin -= padY; yMax += padY;

  const toPx = (x: number) => PAD + ((x - xMin) / (xMax - xMin)) * (W - 2 * PAD);
  const toPy = (y: number) => H - PAD - ((y - yMin) / (yMax - yMin)) * (H - 2 * PAD);

  const buildPath = (fn: (x: number) => number | undefined) => {
    let d = "", drawing = false;
    for (const x of xs) {
      const y = fn(x);
      if (y === undefined || !Number.isFinite(y) || y < yMin || y > yMax) { drawing = false; continue; }
      d += (drawing ? " L " : " M ") + toPx(x).toFixed(1) + " " + toPy(y).toFixed(1);
      drawing = true;
    }
    return d.trim();
  };

  const showXAxis = yMin <= 0 && yMax >= 0;
  const showYAxis = xMin <= 0 && xMax >= 0;
  const isDashed = spec.op === "<" || spec.op === ">";
  const shadeAbove = spec.op === ">" || spec.op === ">=";

  const shadePolygon = () => {
    if (spec.family !== "linear-inequality") return "";
    const yAt = (x: number) => (spec.m ?? 1) * x + (spec.b ?? 0);
    const edgeY = shadeAbove ? yMax : yMin;
    return [
      [xMin, yAt(xMin)], [xMax, yAt(xMax)], [xMax, edgeY], [xMin, edgeY],
    ].map(([x, y]) => `${toPx(x).toFixed(1)},${toPy(Math.max(yMin, Math.min(yMax, y))).toFixed(1)}`).join(" ");
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {[0.25, 0.5, 0.75].map((f) => (
        <line key={f} x1={PAD} y1={PAD + f * (H - 2 * PAD)} x2={W - PAD} y2={PAD + f * (H - 2 * PAD)} stroke={GRID} strokeWidth={1} />
      ))}
      {showXAxis && <line x1={PAD} y1={toPy(0)} x2={W - PAD} y2={toPy(0)} stroke={AXIS} strokeWidth={1.25} />}
      {showYAxis && <line x1={toPx(0)} y1={PAD} x2={toPx(0)} y2={H - PAD} stroke={AXIS} strokeWidth={1.25} />}

      {spec.family === "rational" && (
        <line x1={toPx(spec.asymptoteX ?? 0)} y1={PAD} x2={toPx(spec.asymptoteX ?? 0)} y2={H - PAD} stroke={ACCENT} strokeWidth={1.25} strokeDasharray="3 3" />
      )}

      {spec.family === "linear-inequality" && spec.op && (
        <polygon points={shadePolygon()} fill={PRIMARY} fillOpacity={0.12} />
      )}

      {spec.family === "piecewise" && (spec.pieces ?? []).map((p, i) => (
        <g key={i}>
          <circle cx={toPx(p.from)} cy={toPy(p.m * p.from + p.b)} r={3} fill={p.fromOpen ? "white" : PRIMARY} stroke={PRIMARY} strokeWidth={1.5} />
          <circle cx={toPx(p.to)} cy={toPy(p.m * p.to + p.b)} r={3} fill={p.toOpen ? "white" : PRIMARY} stroke={PRIMARY} strokeWidth={1.5} />
        </g>
      ))}

      <path d={buildPath((x) => evalFamily(spec, x))} fill="none" stroke={PRIMARY} strokeWidth={2} strokeDasharray={isDashed ? "5 4" : undefined} />
      {spec.family === "linear-system" && (
        <path d={buildPath((x) => (spec.m2 ?? -1) * x + (spec.b2 ?? 0))} fill="none" stroke={ACCENT} strokeWidth={2} />
      )}

      {(spec.markPoints ?? []).map((p, i) => (
        <g key={i}>
          <circle cx={toPx(p.x)} cy={toPy(p.y)} r={3.5} fill={ACCENT} />
          {p.label && <text x={toPx(p.x)} y={toPy(p.y) - 8} fontSize={10} textAnchor="middle" fill={ACCENT} fontWeight={600}>{p.label}</text>}
        </g>
      ))}
    </svg>
  );
}

// ── Number line ──

function NumberLineSVG({ spec }: { spec: NumberLineDiagram }) {
  const W = 300, H = 78, PAD = 20;
  const { min, max } = spec;
  const step = spec.step ?? 1;
  const toPx = (v: number) => PAD + ((v - min) / (max - min)) * (W - 2 * PAD);
  const ticks: number[] = [];
  for (let v = min; v <= max + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={PAD} y1={H / 2} x2={W - PAD} y2={H / 2} stroke={AXIS} strokeWidth={1.5} />
      {ticks.map((t) => (
        <g key={t}>
          <line x1={toPx(t)} y1={H / 2 - 4} x2={toPx(t)} y2={H / 2 + 4} stroke={AXIS} strokeWidth={1} />
          <text x={toPx(t)} y={H / 2 + 18} fontSize={9} textAnchor="middle" fill={MUTED_TEXT}>{t}</text>
        </g>
      ))}
      {(spec.intervals ?? []).map((iv, i) => (
        <g key={i}>
          <line x1={toPx(iv.from)} y1={H / 2} x2={toPx(iv.to)} y2={H / 2} stroke={PRIMARY} strokeWidth={4} />
          <circle cx={toPx(iv.from)} cy={H / 2} r={4.5} fill={iv.fromOpen ? "white" : PRIMARY} stroke={PRIMARY} strokeWidth={2} />
          <circle cx={toPx(iv.to)} cy={H / 2} r={4.5} fill={iv.toOpen ? "white" : PRIMARY} stroke={PRIMARY} strokeWidth={2} />
        </g>
      ))}
      {(spec.points ?? []).map((p, i) => (
        <g key={i}>
          <circle cx={toPx(p.value)} cy={H / 2} r={4} fill={ACCENT} />
          {p.label && <text x={toPx(p.value)} y={H / 2 - 10} fontSize={9} textAnchor="middle" fill={ACCENT} fontWeight={600}>{p.label}</text>}
        </g>
      ))}
    </svg>
  );
}

// ── Factor tree ──

interface FNode { value: number; children?: [FNode, FNode] }

function smallestPrimeFactor(n: number): number {
  for (let i = 2; i <= Math.sqrt(n); i++) if (n % i === 0) return i;
  return n;
}
function buildFactorTree(n: number): FNode {
  if (n <= 1) return { value: n };
  const p = smallestPrimeFactor(n);
  if (p === n) return { value: n };
  return { value: n, children: [buildFactorTree(p), buildFactorTree(n / p)] };
}
function countLeaves(node: FNode): number {
  return node.children ? countLeaves(node.children[0]) + countLeaves(node.children[1]) : 1;
}
function treeDepth(node: FNode): number {
  return node.children ? 1 + Math.max(treeDepth(node.children[0]), treeDepth(node.children[1])) : 0;
}
function renderFactorNode(node: FNode, depth: number, xStart: number, width: number, out: React.ReactNode[], key: string): number {
  const cx = xStart + width / 2;
  const cy = depth * 42 + 22;
  if (node.children) {
    const totalLeaves = countLeaves(node);
    const leftLeaves = countLeaves(node.children[0]);
    const leftWidth = (width * leftLeaves) / totalLeaves;
    const lx = renderFactorNode(node.children[0], depth + 1, xStart, leftWidth, out, key + "L");
    const rx = renderFactorNode(node.children[1], depth + 1, xStart + leftWidth, width - leftWidth, out, key + "R");
    out.push(<line key={key + "e1"} x1={cx} y1={cy + 11} x2={lx} y2={(depth + 1) * 42 + 10} stroke={GRID} strokeWidth={1.5} />);
    out.push(<line key={key + "e2"} x1={cx} y1={cy + 11} x2={rx} y2={(depth + 1) * 42 + 10} stroke={GRID} strokeWidth={1.5} />);
  }
  const isPrime = !node.children;
  out.push(
    <g key={key + "n"}>
      <circle cx={cx} cy={cy} r={16} fill={isPrime ? PRIMARY : "white"} stroke={PRIMARY} strokeWidth={1.5} />
      <text x={cx} y={cy + 4} fontSize={11} textAnchor="middle" fontWeight={700} fill={isPrime ? "white" : PRIMARY}>{node.value}</text>
    </g>
  );
  return cx;
}

function FactorTreeSVG({ spec }: { spec: FactorTreeDiagram }) {
  const tree = buildFactorTree(spec.n);
  const depth = treeDepth(tree);
  const elements: React.ReactNode[] = [];
  renderFactorNode(tree, 0, 10, 280, elements, "r");
  return <svg viewBox={`0 0 300 ${depth * 42 + 40}`} className="w-full h-auto">{elements}</svg>;
}

// ── Bar chart (for small data sets in statistics modules) ──

function BarChartSVG({ spec }: { spec: BarChartDiagram }) {
  const W = 300, H = 160, PAD = 26;
  const { data, labels, highlightIndices = [] } = spec;
  const maxV = Math.max(...data, 1);
  const barW = (W - 2 * PAD) / data.length;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke={AXIS} strokeWidth={1} />
      {data.map((v, i) => {
        const barH = (v / maxV) * (H - 2 * PAD - 12);
        const x = PAD + i * barW + barW * 0.15;
        const w = barW * 0.7;
        const y = H - PAD - barH;
        const hl = highlightIndices.includes(i);
        return (
          <g key={i}>
            <rect x={x} y={y} width={w} height={barH} rx={2} fill={hl ? ACCENT : PRIMARY} />
            <text x={x + w / 2} y={y - 4} fontSize={9} textAnchor="middle" fill={TEXT}>{v}</text>
            {labels?.[i] && <text x={x + w / 2} y={H - PAD + 12} fontSize={9} textAnchor="middle" fill={MUTED_TEXT}>{labels[i]}</text>}
          </g>
        );
      })}
    </svg>
  );
}

// ── Shapes (triangles, circles, rectangles, angle pairs, polygons) ──

type Pt = [number, number];
const sub = (a: Pt, b: Pt): Pt => [a[0] - b[0], a[1] - b[1]];
const add = (a: Pt, b: Pt): Pt => [a[0] + b[0], a[1] + b[1]];
const scl = (a: Pt, k: number): Pt => [a[0] * k, a[1] * k];
const unit = (a: Pt): Pt => { const m = Math.hypot(a[0], a[1]) || 1; return [a[0] / m, a[1] / m]; };

function fitPoints(points: Pt[], targetW: number, targetH: number, padding = 22): Pt[] {
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
  const minX = Math.min(...xs), maxX = Math.max(...xs);
  const minY = Math.min(...ys), maxY = Math.max(...ys);
  const w = Math.max(maxX - minX, 0.001), h = Math.max(maxY - minY, 0.001);
  const scale = Math.min((targetW - 2 * padding) / w, (targetH - 2 * padding) / h);
  return points.map(([x, y]) => [
    padding + (x - minX) * scale,
    targetH - padding - (y - minY) * scale,
  ]);
}
function triangleVertices(a: number, b: number, c: number): Pt[] {
  const x = (b * b - a * a + c * c) / (2 * c);
  const y = Math.sqrt(Math.max(0, b * b - x * x));
  return [[0, 0], [c, 0], [x, y]];
}
function rightAngleMarker(A: Pt, B: Pt, C: Pt, size = 11): string {
  const d1 = unit(sub(B, A)), d2 = unit(sub(C, A));
  const p1 = add(A, scl(d1, size)), p2 = add(A, scl(d2, size));
  const p3 = add(p1, scl(d2, size));
  return `${p1[0]},${p1[1]} ${p3[0]},${p3[1]} ${p2[0]},${p2[1]}`;
}

function ShapeSVG({ spec }: { spec: ShapeDiagram }) {
  const W = 280, H = 170;

  if (spec.shape === "triangle" || spec.shape === "right-triangle") {
    const [s1, s2] = spec.sides ?? [3, 4];
    const isRight = spec.shape === "right-triangle";
    const raw: Pt[] = isRight ? [[0, 0], [s1, 0], [0, s2]] : triangleVertices(s1, s2, spec.sides?.[2] ?? 5);
    const pts = fitPoints(raw, W, H);
    const [A, B, C] = pts;
    const labels = spec.labels ?? (isRight ? [String(s1), String(s2), Math.hypot(s1, s2).toFixed(1)] : (spec.sides ?? [3, 4, 5]).map(String));
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={`${PRIMARY}14`} stroke={PRIMARY} strokeWidth={2} />
        {isRight && <polygon points={rightAngleMarker(A, B, C)} fill="none" stroke={PRIMARY} strokeWidth={1.5} />}
        <text x={(A[0] + B[0]) / 2} y={(A[1] + B[1]) / 2 + 16} fontSize={10} textAnchor="middle" fill={TEXT}>{labels[0]}</text>
        <text x={(B[0] + C[0]) / 2 + 12} y={(B[1] + C[1]) / 2} fontSize={10} textAnchor="middle" fill={TEXT}>{labels[1]}</text>
        <text x={(C[0] + A[0]) / 2 - 12} y={(C[1] + A[1]) / 2} fontSize={10} textAnchor="middle" fill={TEXT}>{labels[2]}</text>
      </svg>
    );
  }

  if (spec.shape === "similar-triangles") {
    const small = spec.sides ?? [3, 4, 5];
    const large = spec.sides2 ?? [6, 8, 10];
    const smallPts = fitPoints(triangleVertices(small[0], small[1], small[2]), 110, H, 18);
    const largePtsRaw = triangleVertices(large[0], large[1], large[2]);
    const largePts = fitPoints(largePtsRaw, 150, H, 18).map(([x, y]) => [x + 130, y] as Pt);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <polygon points={smallPts.map((p) => p.join(",")).join(" ")} fill={`${PRIMARY}14`} stroke={PRIMARY} strokeWidth={2} />
        <polygon points={largePts.map((p) => p.join(",")).join(" ")} fill={`${ACCENT}14`} stroke={ACCENT} strokeWidth={2} />
        {small.map((s, i) => <text key={i} x={smallPts[i][0]} y={smallPts[i][1] + (i === 2 ? -6 : 14)} fontSize={9} textAnchor="middle" fill={PRIMARY}>{s}</text>)}
        {large.map((s, i) => <text key={i} x={largePts[i][0]} y={largePts[i][1] + (i === 2 ? -6 : 14)} fontSize={9} textAnchor="middle" fill={ACCENT}>{s}</text>)}
      </svg>
    );
  }

  if (spec.shape === "circle") {
    const r = 55;
    const cx = W / 2, cy = H / 2;
    const radiusLabel = spec.sides?.[0] ?? 4;
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <circle cx={cx} cy={cy} r={r} fill={`${PRIMARY}0d`} stroke={PRIMARY} strokeWidth={2} />
        <line x1={cx} y1={cy} x2={cx + r} y2={cy} stroke={ACCENT} strokeWidth={2} />
        <circle cx={cx} cy={cy} r={2.5} fill={TEXT} />
        <text x={cx + r / 2} y={cy - 6} fontSize={10} textAnchor="middle" fill={ACCENT} fontWeight={600}>r = {radiusLabel}</text>
      </svg>
    );
  }

  if (spec.shape === "rectangle") {
    const [w, h] = spec.sides ?? [8, 5];
    const pts = fitPoints([[0, 0], [w, 0], [w, h], [0, h]], W, H);
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={`${PRIMARY}14`} stroke={PRIMARY} strokeWidth={2} />
        <text x={(pts[0][0] + pts[1][0]) / 2} y={pts[0][1] + 16} fontSize={10} textAnchor="middle" fill={TEXT}>{w}</text>
        <text x={pts[1][0] + 14} y={(pts[1][1] + pts[2][1]) / 2} fontSize={10} textAnchor="middle" fill={TEXT}>{h}</text>
      </svg>
    );
  }

  if (spec.shape === "angle-pair") {
    const cx = W / 2, cy = H / 2, len = 90;
    const deg = spec.angleDeg ?? 60;
    const rad = (deg * Math.PI) / 180;
    const p1: Pt = [cx + len * Math.cos(rad), cy - len * Math.sin(rad)];
    const p2: Pt = [cx - len * Math.cos(rad), cy + len * Math.sin(rad)];
    return (
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <line x1={20} y1={cy} x2={W - 20} y2={cy} stroke={PRIMARY} strokeWidth={2} />
        <line x1={p2[0]} y1={p2[1]} x2={p1[0]} y2={p1[1]} stroke={ACCENT} strokeWidth={2} />
        <path d={`M ${cx + 24} ${cy} A 24 24 0 0 0 ${cx + 24 * Math.cos(rad)} ${cy - 24 * Math.sin(rad)}`} fill="none" stroke={TEXT} strokeWidth={1} />
        <text x={cx + 34} y={cy - 10} fontSize={10} fill={TEXT}>{deg}°</text>
      </svg>
    );
  }

  // polygon
  const n = spec.sidesCount ?? 5;
  const cx = W / 2, cy = H / 2, r = 60;
  const pts: Pt[] = Array.from({ length: n }, (_, i) => {
    const a = (2 * Math.PI * i) / n - Math.PI / 2;
    return [cx + r * Math.cos(a), cy + r * Math.sin(a)];
  });
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <polygon points={pts.map((p) => p.join(",")).join(" ")} fill={`${PRIMARY}14`} stroke={PRIMARY} strokeWidth={2} />
    </svg>
  );
}

// ── Ratio bar (segmented bar model) ──

function RatioBarSVG({ spec }: { spec: RatioBarDiagram }) {
  const W = 280, H = 62;
  const total = spec.parts.reduce((s, p) => s + p.value, 0) || 1;
  const barW = W - 20;
  let x = 10;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {spec.parts.map((p, i) => {
        const w = (p.value / total) * barW;
        const el = (
          <g key={i}>
            <rect x={x} y={14} width={w} height={24} fill={p.color} />
            <text x={x + w / 2} y={30} fontSize={10} textAnchor="middle" fill="white" fontWeight={700}>{p.value}</text>
            <text x={x + w / 2} y={53} fontSize={9} textAnchor="middle" fill={MUTED_TEXT}>{p.label}</text>
          </g>
        );
        x += w;
        return el;
      })}
      <rect x={10} y={14} width={barW} height={24} fill="none" stroke={AXIS} strokeWidth={1} />
    </svg>
  );
}

// ── Balance scale (equation-solving metaphor) ──

function BalanceScaleSVG({ spec }: { spec: BalanceScaleDiagram }) {
  const W = 280, H = 140;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      <polygon points={`${W / 2 - 10},130 ${W / 2 + 10},130 ${W / 2},104`} fill={AXIS} />
      <line x1={40} y1={58} x2={W - 40} y2={58} stroke={PRIMARY} strokeWidth={3} />
      <line x1={W / 2} y1={58} x2={W / 2} y2={104} stroke={AXIS} strokeWidth={3} />
      <line x1={40} y1={58} x2={40} y2={88} stroke={AXIS} strokeWidth={2} />
      <line x1={W - 40} y1={58} x2={W - 40} y2={88} stroke={AXIS} strokeWidth={2} />
      <rect x={8} y={88} width={64} height={28} rx={5} fill={`${PRIMARY}14`} stroke={PRIMARY} strokeWidth={1.5} />
      <text x={40} y={106} fontSize={11} textAnchor="middle" fill={PRIMARY} fontWeight={700}>{spec.leftLabel}</text>
      <rect x={W - 72} y={88} width={64} height={28} rx={5} fill={`${ACCENT}14`} stroke={ACCENT} strokeWidth={1.5} />
      <text x={W - 40} y={106} fontSize={11} textAnchor="middle" fill={ACCENT} fontWeight={700}>{spec.rightLabel}</text>
    </svg>
  );
}

// ── Step sequence (numbered procedure flow) ──

function StepSequenceSVG({ spec }: { spec: StepSequenceDiagram }) {
  const W = 290, boxH = 34, gap = 10;
  const H = spec.steps.length * (boxH + gap) - gap + 10;
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
      {spec.steps.map((s, i) => {
        const y = i * (boxH + gap) + 5;
        const color = i % 2 === 0 ? PRIMARY : ACCENT;
        return (
          <g key={i}>
            <rect x={10} y={y} width={W - 20} height={boxH} rx={8} fill={`${color}0d`} stroke={color} strokeWidth={1.5} />
            <circle cx={27} cy={y + boxH / 2} r={9} fill={color} />
            <text x={27} y={y + boxH / 2 + 3.5} fontSize={10} textAnchor="middle" fill="white" fontWeight={700}>{i + 1}</text>
            <text x={44} y={y + boxH / 2 + 4} fontSize={9.5} fill={TEXT}>{s}</text>
            {i < spec.steps.length - 1 && <line x1={W / 2} y1={y + boxH} x2={W / 2} y2={y + boxH + gap} stroke={GRID} strokeWidth={1.5} />}
          </g>
        );
      })}
    </svg>
  );
}

// ── Unit circle ──

function UnitCircleSVG({ spec }: { spec: UnitCircleDiagram }) {
  const W = 200, H = 200, cx = 100, cy = 100, r = 70;
  const rad = (spec.angleDeg * Math.PI) / 180;
  const px = cx + r * Math.cos(rad), py = cy - r * Math.sin(rad);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto mx-auto" style={{ maxWidth: 220 }}>
      <line x1={10} y1={cy} x2={W - 10} y2={cy} stroke={GRID} strokeWidth={1} />
      <line x1={cx} y1={10} x2={cx} y2={H - 10} stroke={GRID} strokeWidth={1} />
      <circle cx={cx} cy={cy} r={r} fill="none" stroke={PRIMARY} strokeWidth={1.5} />
      <line x1={cx} y1={cy} x2={px} y2={py} stroke={ACCENT} strokeWidth={2} />
      <circle cx={px} cy={py} r={4} fill={ACCENT} />
      <text x={px + (px > cx ? 8 : -8)} y={py} fontSize={10} textAnchor={px > cx ? "start" : "end"} fill={ACCENT} fontWeight={600}>{spec.angleDeg}°</text>
    </svg>
  );
}

// ── Dispatcher ──

export default function Diagram({ spec }: { spec: DiagramSpec }) {
  return (
    <div className="bg-muted/30 border border-border rounded-lg p-4">
      {spec.kind === "graph" && <FunctionGraphSVG spec={spec} />}
      {spec.kind === "number-line" && <NumberLineSVG spec={spec} />}
      {spec.kind === "factor-tree" && <FactorTreeSVG spec={spec} />}
      {spec.kind === "bar-chart" && <BarChartSVG spec={spec} />}
      {spec.kind === "shape" && <ShapeSVG spec={spec} />}
      {spec.kind === "ratio-bar" && <RatioBarSVG spec={spec} />}
      {spec.kind === "balance-scale" && <BalanceScaleSVG spec={spec} />}
      {spec.kind === "step-sequence" && <StepSequenceSVG spec={spec} />}
      {spec.kind === "unit-circle" && <UnitCircleSVG spec={spec} />}
      {spec.caption && <p className="text-xs text-muted-foreground text-center mt-2">{spec.caption}</p>}
    </div>
  );
}
