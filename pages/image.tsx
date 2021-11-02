import type { NextPage } from "next";
import React, { useEffect, useRef, useState } from "react";
import Layout from "@/components/_Layout";
import styles from "@/styles/Home.module.css";
import cv from "../services/cv";
import { createworker } from "tesseract.js";
import { split } from "cypress/types/lodash";

//@ts-ignore
const ImagePage: NextPage = () => {
  const canvasGridRef = useRef(null);
  const canvasDownCluesRef = useRef(null);
  const canvasAcrossCluesRef = useRef(null);
  const [gridWidth, setGridWidth] = useState(0)
  const [gridHeight, setGridHeight] = useState(0)
  const [downWidth, setDownWidth] = useState(0)
  const [downHeight, setDownHeight] = useState(0)
  const [acrossWidth, setAcrossWidth] = useState(0)
  const [acrossHeight, setAcrossHeight] = useState(0)
  const [acrossLoaded, setAcrossLoaded] = useState(false)
  const [downLoaded, setDownLoaded] = useState(false)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [acrossClues, setAcrossClues] = useState([])
  const [downClues, setDownClues] = useState([])
  const [grid, setGrid] = useState({})

  const workerAcross = createworker({
    logger: (m: any) => console.log(m),
  });

  const workerDown = createworker({
    logger: (m: any) => console.log(m),
  });

  const preprocess = (text: string) => {
    // Preprocess weird characters
    let character_replacements = new Map([
      ["©", "(5)"],
      ["|", "I"],
      ["®", "(5"],
    ]);

    character_replacements.forEach((replacement, key) => {
      text = text.replace(key, replacement);
    });

    // Take care of cases where the lengths of a two-word clue have been stuck together
    for (let i = 0; i < text.length - 2; i++) {
      if (
        text.charAt(i) == "(" &&
        text.charAt(i + 1) > "1" &&
        text.charAt(i + 1) <= "9" &&
        text.charAt(i + 2) >= "1" &&
        text.charAt(i + 2) <= "9"
      ) {
        text =
          text.substring(0, i + 2) + "," + text.substring(i + 2, text.length);
      }
    }

    return text;
  };

  const extract_clues = (text: string) => {
    text = preprocess(text);

    console.log("Preprocessed text: " + text);


    let parts = text.split("\n\n");
    let clues = [];

    for (let part of parts) {
      let part_new = part.replace(/\n/g, "");
      let front = part_new;
      let lengths: string[] = [];

      if (part.includes("(")) {
        let splittedPart = part_new.split("(");
        front = splittedPart[0];
        let lengthsWithComma = splittedPart[1].substring(
          0,
          splittedPart[1].length - 1
        );

        if (lengthsWithComma.includes(",")) {
          lengths = lengthsWithComma.split(",");
        } else {
          lengths = [lengthsWithComma];
        }
      }

      let i = 0;
      while (front[i] != " ") {
        i++;
      }

      let number = front.substring(0, i);
      let clue = front.substring(i + 1);

      clues.push({
        clueNumber: number,
        clue: clue,
        lengths: lengths,
      });
    }
    return clues;
  };

  const fill_clues = (across_clues: array, down_clues: array, grid: object) => {
    let grid_clues = grid.payload.clues

    down_clues.forEach((clue: { clueNumber: string; clue: any; lengths: any[]; }) => {
      grid_clues.forEach((grid_clue: { direction: number; number: number; text: any; lengths: any; }) => {
        if (grid_clue.direction == 1 && grid_clue.number == parseInt(clue.clueNumber)) {
          grid_clue.text = clue.clue
          grid_clue.lengths = clue.lengths.map(l => parseInt(l))
        }
      });
    });

    across_clues.forEach((clue: { clueNumber: string; clue: any; lengths: any[]; }) => {
      grid_clues.forEach((grid_clue: { direction: number; number: number; text: any; lengths: number[]; }) => {
        if (grid_clue.direction == 0 && grid_clue.number == parseInt(clue.clueNumber)) {
          grid_clue.text = clue.clue
          grid_clue.lengths = clue.lengths.map(l => parseInt(l))
        }
      });
    });

    return grid
  }

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
      ctxAcrossClues.width = acrossClues.width
      ctxAcrossClues.height = acrossClues.height
      setAcrossWidth(acrossClues.width)
      setAcrossHeight(acrossClues.height)
      ctxAcrossClues.drawImage(acrossClues, 0, 0);
      const {
        data: { text },
      } = await workerDown.recognize(acrossClues);
      console.log(`Text: ${text}`);

      let clues = extract_clues(text)
      setAcrossClues(clues)
      setAcrossLoaded(true)
    };


    //@ts-ignore
    const ctxClues = canvasDownCluesRef.current.getContext("2d");
    const downClues = new Image();
    downClues.src = "./down_clues.png";
    downClues.onload = async () => {
      ctxClues.width = downClues.width
      ctxClues.height = downClues.height
      setDownWidth(downClues.width)
      setDownHeight(downClues.height)
      ctxClues.drawImage(downClues, 0, 0);
      const {
        data: { text },
      } = await workerAcross.recognize(downClues);
      console.log(`Text: ${text}`);

      // DEBUG
      let down_clues = extract_clues(text)
      setDownClues(down_clues)
      setDownLoaded(true)
    };

    //@ts-ignore
    const ctxGrid = canvasGridRef.current.getContext("2d");
    const imageGrid = new Image();
    imageGrid.src = "./grid_image.png";
    
    imageGrid.onload = async () => {
      ctxGrid.width = imageGrid.width
      ctxGrid.height = imageGrid.height
      setGridWidth(imageGrid.width)
      setGridHeight(imageGrid.height)
      ctxGrid.drawImage(imageGrid, 0, 0);
      let imgData = ctxGrid.getImageData(0, 0, imageGrid.width, imageGrid.height);
    
      await cv
        .getGridFromImage(imgData)
        .then((res) => {
          console.log("Completed Promise");
          setGrid(res)
          setImageLoaded(true)
        })
        .catch((err) => {
          console.log("Error occurred trying to process image");
          console.log(err);
        });
    };
  }, []);

  //@ts-ignore
  useEffect(async () => {
    if (acrossLoaded && downLoaded && imageLoaded){
      console.log(fill_clues(acrossClues, downClues, grid.data))
    }
  }, [acrossLoaded, downLoaded, imageLoaded]);

  return (
    <Layout>
      <>
      <div>
          <canvas ref={canvasAcrossCluesRef} width={acrossWidth} height={acrossHeight} />
          <canvas ref={canvasGridRef} width={gridWidth} height={gridHeight} />
          <canvas ref={canvasDownCluesRef} width={downWidth} height={downHeight} />
        </div>
      </>
    </Layout>
  );
};

export default ImagePage;

