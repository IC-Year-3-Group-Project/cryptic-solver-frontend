import { Box } from "@mui/system";
import { useEffect, useRef, useState, MouseEvent } from "react";
import { loadImageAsync } from "../utils";

export interface ImageCropProps {
  url?: string;
  reset?: boolean;
  urlType?: "data" | "blob";
  onCrop?: (url: string, bounds: Rect) => void;
  onCropReset?: () => void;
}

export class Rect {
  left: number = 0;
  top: number = 0;
  right: number = 0;
  bottom: number = 0;

  get width(): number {
    return this.right - this.left;
  }

  get height(): number {
    return this.bottom - this.top;
  }

  get area(): number {
    return Math.abs(this.width) * Math.abs(this.height);
  }

  constructor(
    left: number = 0,
    top: number = 0,
    right: number = 0,
    bottom: number = 0
  ) {
    this.left = left;
    this.top = top;
    this.right = right;
    this.bottom = bottom;
  }

  normalise(): Rect {
    const normal = new Rect(this.left, this.top, this.right, this.bottom);
    if (this.left > this.right) {
      normal.left = this.right;
      normal.right = this.left;
    }

    if (this.top > this.bottom) {
      normal.top = this.bottom;
      normal.bottom = this.top;
    }

    return normal;
  }

  contains(x: number, y: number): boolean {
    return (
      x >= this.left && x <= this.right && y >= this.top && y <= this.bottom
    );
  }

  containsRect(rect: Rect): boolean {
    return (
      rect.left >= this.left &&
      rect.right <= this.right &&
      rect.top >= this.top &&
      rect.bottom <= this.bottom
    );
  }

  translate(dx: number, dy: number): Rect {
    return new Rect(
      this.left + dx,
      this.top + dy,
      this.right + dx,
      this.bottom + dy
    );
  }

  static createSquare(x: number, y: number, radius: number): Rect {
    return new Rect(x - radius, y - radius, x + radius, y + radius);
  }
}

export interface MouseModifier {
  (x: number, y: number, rect: Rect, dx: number, dy: number): Rect;
}

const HandleRadius = 8;

export default function ImageCrop(props: ImageCropProps) {
  const { url, reset, urlType, onCrop, onCropReset } = props;
  const canvasRef = useRef(null);
  const [context, setContext] = useState<CanvasRenderingContext2D>();
  const [fullImage, setFullImage] = useState<HTMLImageElement>();
  const [complete, setComplete] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState(new Rect());
  const [mouseModifier, setMouseModifier] = useState<MouseModifier>();

  const [lastReset, setLastReset] = useState(!reset);

  useEffect(() => {
    if (reset != undefined && reset != lastReset) {
      setDrawing(false);
      setComplete(false);
      setCurrentRect(new Rect());
      setLastReset(reset);
    }
  }, [reset]);

  useEffect(() => {
    async function loadFullImage(url: string) {
      setFullImage(await loadImageAsync(url!));
    }

    if (url) {
      loadFullImage(url);
    }
  }, [url]);

  useEffect(() => {
    if (canvasRef.current) {
      const context = (canvasRef.current as HTMLCanvasElement).getContext("2d");
      if (context) {
        setContext(context);
      }
    }
  }, [canvasRef]);

  useEffect(() => {
    redraw();
  }, [fullImage]);

  useEffect(() => {
    redraw();
  }, [drawing, complete, currentRect]);

  function redraw() {
    if (context && fullImage) {
      context.drawImage(fullImage, 0, 0);
      if (complete || (drawing && currentRect.area > 0)) {
        context.fillStyle = "#00000044";
        context.fillRect(0, 0, context.canvas.width, context.canvas.height);
        context.drawImage(
          fullImage,
          currentRect.left,
          currentRect.top,
          currentRect.width,
          currentRect.height,
          currentRect.left,
          currentRect.top,
          currentRect.width,
          currentRect.height
        );
      }

      context.strokeStyle = complete ? "#00FF00" : "#FF0000";
      context.lineWidth = 2;
      context.strokeRect(
        currentRect.left,
        currentRect.top,
        currentRect.width,
        currentRect.height
      );

      if (complete) {
        function drawHandle(x: number, y: number) {
          context!.fillRect(
            x - HandleRadius,
            y - HandleRadius,
            HandleRadius * 2,
            HandleRadius * 2
          );
        }

        context.fillStyle = "#FF00FF";
        drawHandle(currentRect.left, currentRect.top);
        drawHandle(currentRect.right, currentRect.top);
        drawHandle(currentRect.right, currentRect.bottom);
        drawHandle(currentRect.left, currentRect.bottom);
      }
    }
  }

  function getCanvasPos(pos: { clientX: number; clientY: number }): number[] {
    if (context) {
      const clientRect = context.canvas.getBoundingClientRect();
      return [pos.clientX - clientRect.left, pos.clientY - clientRect.top];
    }

    return [pos.clientX, pos.clientY];
  }

  function onMouseDown(event: MouseEvent<HTMLCanvasElement>) {
    const [x, y] = getCanvasPos(event);
    setMouseModifier(undefined);
    setDrawing(true);
    if (
      complete &&
      Rect.createSquare(
        currentRect.left,
        currentRect.top,
        HandleRadius
      ).contains(x, y)
    ) {
      setMouseModifier(
        () => (x: number, y: number, rect: Rect) =>
          new Rect(x, y, rect.right, rect.bottom)
      );
    } else if (
      complete &&
      Rect.createSquare(
        currentRect.right,
        currentRect.top,
        HandleRadius
      ).contains(x, y)
    ) {
      setMouseModifier(
        () => (x: number, y: number, rect: Rect) =>
          new Rect(rect.left, y, x, rect.bottom)
      );
    } else if (
      complete &&
      Rect.createSquare(
        currentRect.right,
        currentRect.bottom,
        HandleRadius
      ).contains(x, y)
    ) {
      setMouseModifier(
        () => (x: number, y: number, rect: Rect) =>
          new Rect(rect.left, rect.top, x, y)
      );
    } else if (
      complete &&
      Rect.createSquare(
        currentRect.left,
        currentRect.bottom,
        HandleRadius
      ).contains(x, y)
    ) {
      setMouseModifier(
        () => (x: number, y: number, rect: Rect) =>
          new Rect(x, rect.top, rect.right, y)
      );
    } else if (complete && currentRect.contains(x, y)) {
      setMouseModifier(
        () => (_x: number, _y: number, rect: Rect, dx: number, dy: number) => {
          const newRect = rect.translate(dx, dy);
          return new Rect(
            0,
            0,
            context?.canvas.width,
            context?.canvas.height
          ).containsRect(newRect)
            ? newRect
            : rect;
        }
      );
    } else {
      setCurrentRect(new Rect(x, y, x, y));
      setComplete(false);
    }
  }

  function onMouseMove(event: MouseEvent<HTMLCanvasElement>) {
    if (drawing) {
      const [x, y] = getCanvasPos(event);
      if (mouseModifier) {
        setCurrentRect(
          mouseModifier(
            x,
            y,
            currentRect.normalise(),
            event.movementX,
            event.movementY
          )
        );
      } else {
        setCurrentRect(new Rect(currentRect.left, currentRect.top, x, y));
      }
    }
  }

  function onMouseUp(event: MouseEvent<HTMLCanvasElement>) {
    const localComplete = currentRect.area > 0;
    setDrawing(false);
    setComplete(localComplete);
    setMouseModifier(undefined);

    if (localComplete && onCrop) {
      const canvas = document.createElement("canvas") as HTMLCanvasElement;
      canvas.width = Math.abs(currentRect.width);
      canvas.height = Math.abs(currentRect.height);
      const context = canvas.getContext("2d");
      if (context) {
        context.drawImage(
          fullImage!,
          currentRect.left,
          currentRect.top,
          currentRect.width,
          currentRect.height,
          0,
          0,
          canvas.width,
          canvas.height
        );
        if (urlType == "blob") {
          canvas.toBlob((blob) =>
            onCrop(URL.createObjectURL(blob), currentRect)
          );
        } else {
          onCrop(canvas.toDataURL(), currentRect);
        }
      }
    } else if (onCropReset) {
      onCropReset();
    }
  }

  function onMouseLeave(event: MouseEvent<HTMLCanvasElement>) {
    if (!complete) {
      onMouseUp(event);
    }
  }

  return (
    <Box>
      <canvas
        style={{ border: "2px solid black" }}
        ref={canvasRef}
        width={fullImage?.width}
        height={fullImage?.height}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseLeave}
      ></canvas>
    </Box>
  );
}
