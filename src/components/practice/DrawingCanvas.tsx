import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";

type Tool = "pen" | "eraser";

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  tool: Tool;
}

interface DrawingCanvasProps {
  onDirtyChange?: (dirty: boolean) => void;
}

const PEN_COLOR = "#111827";
const LINE_WIDTH = 3;
const ERASER_WIDTH = 20;

export const DrawingCanvas: React.FC<DrawingCanvasProps> = ({ onDirtyChange }) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [tool, setTool] = useState<Tool>("pen");
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const currentStrokeRef = useRef<Stroke | null>(null);
  const isDrawingRef = useRef(false);

  const dirty = useMemo(() => strokes.length > 0, [strokes.length]);

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      if (stroke.points.length < 2) {
        continue;
      }

      context.save();
      context.lineCap = "round";
      context.lineJoin = "round";

      if (stroke.tool === "eraser") {
        context.globalCompositeOperation = "destination-out";
        context.strokeStyle = "rgba(0,0,0,1)";
        context.lineWidth = ERASER_WIDTH;
      } else {
        context.globalCompositeOperation = "source-over";
        context.strokeStyle = PEN_COLOR;
        context.lineWidth = LINE_WIDTH;
      }

      context.beginPath();
      context.moveTo(stroke.points[0].x, stroke.points[0].y);
      for (let i = 1; i < stroke.points.length; i++) {
        context.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      context.stroke();
      context.restore();
    }
  }, [strokes]);

  const resizeCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) {
      return;
    }

    const ratio = window.devicePixelRatio || 1;
    const width = container.clientWidth;
    const height = container.clientHeight;

    canvas.width = Math.floor(width * ratio);
    canvas.height = Math.floor(height * ratio);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.setTransform(ratio, 0, 0, ratio, 0, 0);
    redrawCanvas();
  }, [redrawCanvas]);

  const getCanvasPoint = useCallback((event: React.PointerEvent<HTMLCanvasElement>): Point => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return { x: 0, y: 0 };
    }

    const rect = canvas.getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }, []);

  const drawSegment = useCallback((from: Point, to: Point, activeTool: Tool) => {
    const canvas = canvasRef.current;
    if (!canvas) {
      return;
    }

    const context = canvas.getContext("2d");
    if (!context) {
      return;
    }

    context.save();
    context.lineCap = "round";
    context.lineJoin = "round";

    if (activeTool === "eraser") {
      context.globalCompositeOperation = "destination-out";
      context.strokeStyle = "rgba(0,0,0,1)";
      context.lineWidth = ERASER_WIDTH;
    } else {
      context.globalCompositeOperation = "source-over";
      context.strokeStyle = PEN_COLOR;
      context.lineWidth = LINE_WIDTH;
    }

    context.beginPath();
    context.moveTo(from.x, from.y);
    context.lineTo(to.x, to.y);
    context.stroke();
    context.restore();
  }, []);

  const handlePointerDown = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    const point = getCanvasPoint(event);
    const stroke: Stroke = {
      points: [point],
      tool,
    };

    isDrawingRef.current = true;
    currentStrokeRef.current = stroke;
    event.currentTarget.setPointerCapture(event.pointerId);
  }, [getCanvasPoint, tool]);

  const handlePointerMove = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    if (!isDrawingRef.current || !currentStrokeRef.current) {
      return;
    }

    event.preventDefault();
    const nextPoint = getCanvasPoint(event);
    const currentStroke = currentStrokeRef.current;
    const previousPoint = currentStroke.points[currentStroke.points.length - 1];

    currentStroke.points.push(nextPoint);
    drawSegment(previousPoint, nextPoint, currentStroke.tool);
  }, [drawSegment, getCanvasPoint]);

  const finalizeStroke = useCallback(() => {
    if (!isDrawingRef.current || !currentStrokeRef.current) {
      return;
    }

    const finishedStroke = currentStrokeRef.current;
    isDrawingRef.current = false;
    currentStrokeRef.current = null;

    setStrokes((previous) => [...previous, finishedStroke]);
  }, []);

  const handlePointerUp = useCallback((event: React.PointerEvent<HTMLCanvasElement>) => {
    event.preventDefault();
    finalizeStroke();
    event.currentTarget.releasePointerCapture(event.pointerId);
  }, [finalizeStroke]);

  const clearCanvas = useCallback(() => {
    setStrokes([]);
    const canvas = canvasRef.current;
    const context = canvas?.getContext("2d");
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  }, []);

  useEffect(() => {
    resizeCanvas();
    const onResize = () => resizeCanvas();
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
    };
  }, [resizeCanvas]);

  useEffect(() => {
    redrawCanvas();
  }, [redrawCanvas]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  return (
    <div className="w-full max-w-3xl mx-auto space-y-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-2">
          <button
            onClick={() => setTool("pen")}
            className={`px-4 py-2 rounded-lg font-semibold ${
              tool === "pen" ? "bg-blue-500 text-black" : "bg-gray-300 text-black"
            }`}
          >
            Pen
          </button>
          <button
            onClick={() => setTool("eraser")}
            className={`px-4 py-2 rounded-lg font-semibold ${
              tool === "eraser" ? "bg-blue-500 text-black" : "bg-gray-300 text-black"
            }`}
          >
            Eraser
          </button>
        </div>
        <button
          onClick={clearCanvas}
          className="px-4 py-2 rounded-lg font-semibold bg-red-300 hover:bg-red-400 text-black"
        >
          Clear
        </button>
      </div>

      <div ref={containerRef} className="w-full h-[320px] sm:h-[380px] bg-white rounded-xl shadow-inner overflow-hidden border border-gray-300">
        <canvas
          ref={canvasRef}
          className="w-full h-full touch-none"
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={finalizeStroke}
          onPointerLeave={finalizeStroke}
        />
      </div>
    </div>
  );
};

export default DrawingCanvas;
