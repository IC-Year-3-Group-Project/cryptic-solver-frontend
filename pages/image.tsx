import type { NextPage } from "next";
import React, { useEffect, useRef, useState } from "react";
import Layout from "@/components/_Layout";
import styles from "@/styles/Home.module.css";
import cv from "../services/cv";
import { createWorker } from "tesseract.js";
import { split } from "cypress/types/lodash";
import {
  preprocess,
  extract_clues,
  fill_clues,
} from "@/components/ImageProcessing/utils";

//@ts-ignore
const ImagePage: NextPage = () => {
  const canvasGridRef = useRef(null);
  const canvasDownCluesRef = useRef(null);
  const canvasAcrossCluesRef = useRef(null);
  const [gridWidth, setGridWidth] = useState(0);
  const [gridHeight, setGridHeight] = useState(0);
  const [downWidth, setDownWidth] = useState(0);
  const [downHeight, setDownHeight] = useState(0);
  const [acrossWidth, setAcrossWidth] = useState(0);
  const [acrossHeight, setAcrossHeight] = useState(0);
  const [acrossLoaded, setAcrossLoaded] = useState(false);
  const [downLoaded, setDownLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [acrossClues, setAcrossClues] = useState<any>({});
  const [downClues, setDownClues] = useState<any>({});
  const [grid, setGrid] = useState<any>({});

  const workerAcross = createWorker({
    logger: (m: any) => console.log(m),
  });

  const workerDown = createWorker({
    logger: (m: any) => console.log(m),
  });

  //@ts-ignore
  useEffect(async () => {
    console.log("loading...");
    await cv.load();
    await workerAcross.load();
    await workerAcross.loadLanguage("eng");
    await workerAcross.initialize("eng");
    await workerDown.load();
    await workerDown.loadLanguage("eng");
    await workerDown.initialize("eng");

    //@ts-ignore
    const ctxAcrossClues = canvasAcrossCluesRef.current.getContext("2d");
    const acrossClues = new Image();
    acrossClues.src = "./across_clues.png";
    acrossClues.onload = async () => {
      ctxAcrossClues.width = acrossClues.width;
      ctxAcrossClues.height = acrossClues.height;
      setAcrossWidth(acrossClues.width);
      setAcrossHeight(acrossClues.height);
      ctxAcrossClues.drawImage(acrossClues, 0, 0);
      const {
        data: { text },
      } = await workerDown.recognize(acrossClues);
      console.log(`Text: ${text}`);

      let clues = extract_clues(text);
      setAcrossClues(clues);
      setAcrossLoaded(true);
    };

    //@ts-ignore
    const ctxClues = canvasDownCluesRef.current.getContext("2d");
    const downClues = new Image();
    downClues.src = "./down_clues.png";
    downClues.onload = async () => {
      ctxClues.width = downClues.width;
      ctxClues.height = downClues.height;
      setDownWidth(downClues.width);
      setDownHeight(downClues.height);
      ctxClues.drawImage(downClues, 0, 0);
      const {
        data: { text },
      } = await workerAcross.recognize(downClues);
      console.log(`Text: ${text}`);

      // DEBUG
      let down_clues = extract_clues(text);
      setDownClues(down_clues);
      setDownLoaded(true);
    };

    //@ts-ignore
    const ctxGrid = canvasGridRef.current.getContext("2d");
    const imageGrid = new Image();
    imageGrid.src = "./grid_image.png";

    imageGrid.onload = async () => {
      ctxGrid.width = imageGrid.width;
      ctxGrid.height = imageGrid.height;
      setGridWidth(imageGrid.width);
      setGridHeight(imageGrid.height);
      ctxGrid.drawImage(imageGrid, 0, 0);
      let imgData = ctxGrid.getImageData(
        0,
        0,
        imageGrid.width,
        imageGrid.height
      );

      await cv
        .getGridFromImage(imgData)
        .then((res) => {
          console.log("Completed Promise");
          setGrid(res);
          setImageLoaded(true);
        })
        .catch((err) => {
          console.log("Error occurred trying to process image");
          console.log(err);
        });
    };
  }, []);

  //@ts-ignore
  useEffect(async () => {
    if (acrossLoaded && downLoaded && imageLoaded) {
      console.log(fill_clues(acrossClues, downClues, grid.data));
    }
  }, [acrossLoaded, downLoaded, imageLoaded]);

  return (
    <Layout>
      <>
        <div>
          <canvas
            ref={canvasAcrossCluesRef}
            width={acrossWidth}
            height={acrossHeight}
          />
          <canvas ref={canvasGridRef} width={gridWidth} height={gridHeight} />
          <canvas
            ref={canvasDownCluesRef}
            width={downWidth}
            height={downHeight}
          />
        </div>
      </>
    </Layout>
  );
};

export default ImagePage;
