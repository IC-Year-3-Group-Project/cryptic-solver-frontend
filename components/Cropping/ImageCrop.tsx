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
}

export default function ImageCrop(props: ImageCropProps) {
  const { url, reset, urlType, onCrop, onCropReset } = props;
  const canvasRef = useRef(null);
  const [context, setContext] = useState<CanvasRenderingContext2D>();
  const [fullImage, setFullImage] = useState<HTMLImageElement>();
  const [complete, setComplete] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [currentRect, setCurrentRect] = useState(new Rect());

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
      context.lineWidth = 4;
      context.strokeRect(
        currentRect.left,
        currentRect.top,
        currentRect.width,
        currentRect.height
      );
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
    setCurrentRect(new Rect(x, y, x, y));
    setComplete(false);
    setDrawing(true);
  }

  function onMouseMove(event: MouseEvent<HTMLCanvasElement>) {
    if (drawing) {
      const [x, y] = getCanvasPos(event);
      setCurrentRect(new Rect(currentRect.left, currentRect.top, x, y));
    }
  }

  function onMouseUp(event: MouseEvent<HTMLCanvasElement>) {
    const localComplete = currentRect.area > 0;
    setDrawing(false);
    setComplete(localComplete);

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
