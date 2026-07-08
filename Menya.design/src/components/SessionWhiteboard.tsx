import { useEffect, useRef, useState } from "react";
import { Eraser } from "lucide-react";
import { useSessionContent, type Point, type Stroke } from "../context/SessionContentContext";

const COLORS = ["#1B5E4F", "#EF4444", "#3B82F6", "#111827"];

function drawStroke(ctx: CanvasRenderingContext2D, stroke: Stroke) {
  if (stroke.points.length === 0) return;
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
  for (const point of stroke.points.slice(1)) {
    ctx.lineTo(point.x, point.y);
  }
  ctx.stroke();
}

export default function SessionWhiteboard({ sessionId }: { sessionId: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const currentPoints = useRef<Point[]>([]);
  const [color, setColor] = useState(COLORS[0]);
  const { getContent, addStroke, clearStrokes } = useSessionContent();
  const strokes = getContent(sessionId).strokes;

  const redraw = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    for (const stroke of strokes) drawStroke(ctx, stroke);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const resize = () => {
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width;
      canvas.height = height;
      redraw();
    };
    resize();
    window.addEventListener("resize", resize);
    return () => window.removeEventListener("resize", resize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    redraw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [strokes]);

  const getPos = (e: React.PointerEvent<HTMLCanvasElement>): Point => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const startDraw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    drawing.current = true;
    currentPoints.current = [getPos(e)];
  };

  const draw = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const from = currentPoints.current[currentPoints.current.length - 1];
    const to = getPos(e);
    currentPoints.current.push(to);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
  };

  const endDraw = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (currentPoints.current.length > 1) {
      addStroke(sessionId, { color, points: currentPoints.current });
    }
    currentPoints.current = [];
  };

  const clear = () => clearStrokes(sessionId);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-black/10">
        {COLORS.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            aria-label={`Select color ${c}`}
            className={`w-5 h-5 rounded-full border-2 transition-colors ${color === c ? "border-black/60" : "border-transparent"}`}
            style={{ backgroundColor: c }}
          />
        ))}
        <button
          onClick={clear}
          className="ml-auto flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-black/60 hover:bg-black/5 transition-colors"
        >
          <Eraser className="w-3.5 h-3.5" /> Clear
        </button>
      </div>
      <canvas
        ref={canvasRef}
        onPointerDown={startDraw}
        onPointerMove={draw}
        onPointerUp={endDraw}
        onPointerLeave={endDraw}
        className="flex-1 w-full h-full cursor-crosshair touch-none"
      />
    </div>
  );
}
