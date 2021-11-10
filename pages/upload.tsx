import ImageUpload from "@/components/ImageUpload";
import { useRouter } from "next/router";
import Layout from "@/components/_Layout";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Box from "@mui/system/Box";
import React, { useState } from "react";
import cv from "../services/cv";
import { createWorker } from "tesseract.js";
import { extractClues, fillClues } from "@/components/ImageProcessing/utils";
import { Clue } from "@/components/Crossword/model/Clue";
import Backdrop from "@mui/material/Backdrop";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import LinearProgress from "@mui/material/LinearProgress";
import LoadingButton from "@mui/lab/LoadingButton";
import { loadImageAsync } from "@/components/utils";
import CropFlow from "@/components/Cropping/CropFlow";

export default function Upload() {
  const router = useRouter();

  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<string>();
  const [error, setError] = useState(false);
  const [processingError, setProcessingError] = useState(false);

  const [imageUrls, setImageUrls] = useState<{ [key: string]: string }>({});

  // Uses CV to extract the grid from its image.
  async function processGrid(): Promise<any> {
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    const context = canvas.getContext("2d")!;
    const gridImage = await loadImageAsync(imageUrls.grid!);
    canvas.width = gridImage.width;
    canvas.height = gridImage.height;
    context.drawImage(gridImage, 0, 0);
    const imgData = context.getImageData(
      0,
      0,
      gridImage.width,
      gridImage.height
    );

    try {
      // Await grid processing and return payload from worker message.
      const result = await cv.getGridFromImage(imgData);
      return result.data.payload;
    } catch (ex) {
      console.log("Error occured while processing grid.", ex);
    } finally {
      // Must be killed.
      cv.worker?.terminate();
    }

    // Something went wrong...
    return undefined;
  }

  async function handleProcess() {
    setError(false);
    setProgress(-1);
    setStatus("Loading OpenCV...");
    await cv.load();

    setStatus("Processing grid...");
    const grid = await processGrid();
    if (!grid) {
      setStatus("Failed to process grid.");
      setError(true);
      return;
    }

    // Create one new tesseract worker.
    const worker = createWorker({
      logger: (message: any) => {
        if (message.progress) {
          setProgress(message.progress * 100);
        }
      },
    });
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");

    // Processes an image with the tessaract worker to extract the text and then clues.
    async function processImage(imageUrl: string): Promise<Partial<Clue>[]> {
      const {
        data: { text },
      } = await worker.recognize(imageUrl);
      return extractClues(text);
    }

    // Load and process across and down images.
    setStatus("Processing across clues...");
    const acrossClues = await processImage(imageUrls.across!);
    setStatus("Processing down clues...");
    const downClues = await processImage(imageUrls.down!);

    // Kill tesseract worker.
    await worker.terminate();

    // Fill clues into processed grid.
    fillClues(acrossClues, downClues, grid);
    setStatus(undefined);

    // Navigate to crossword page with processed crossword.
    router.push(`/crossword?raw=${JSON.stringify(grid)}`);
  }

  return (
    <>
      <Button
        style={{ marginLeft: "2rem", marginTop: "2rem" }}
        onClick={() => router.push("/")}
      >
        🠐 Back
      </Button>
      <Box
        sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}
      >
        <CropFlow
          stages={[
            { name: "grid", text: "Crop Grid" },
            { name: "across", text: "Crop Across Clues" },
            { name: "down", text: "Crop Down Clues" },
          ]}
          onComplete={(stages) => setImageUrls(stages)}
        />
        <Box mt={5}>
          <LoadingButton
            variant="contained"
            onClick={handleProcess}
            loading={status != undefined}
            disabled={Object.keys(imageUrls).length < 3}
          >
            Process Images
          </LoadingButton>
          {error && (
            <Typography color="secondary" sx={{ mt: 2 }}>
              {status}
            </Typography>
          )}
        </Box>
      </Box>
      {processingError && (
        <Typography>
          Please upload a picture of the grid, down clues and across clues
        </Typography>
      )}
      <Backdrop
        sx={{ color: "#fff", zIndex: 100, flexDirection: "column" }}
        open={status != undefined}
      >
        <Typography sx={{ mb: 2 }}>{status}</Typography>
        {progress == -1 ? (
          <CircularProgress color="inherit" />
        ) : (
          <>
            <Box sx={{ width: "50%", mb: 1 }}>
              <LinearProgress
                color="inherit"
                variant="determinate"
                value={progress}
              />
            </Box>
            <Typography>{Math.floor(progress)}%</Typography>
          </>
        )}
      </Backdrop>
    </>
  );
}
