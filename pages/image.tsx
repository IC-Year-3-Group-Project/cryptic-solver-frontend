import type { NextPage } from "next";
import React, { useEffect, useRef } from "react";
import Layout from "@/components/_Layout";
import styles from "@/styles/Home.module.css";
import cv from "../services/cv";
import { createWorker } from "tesseract.js";
import { split } from "cypress/types/lodash";

//@ts-ignore
const ImagePage: NextPage = () => {
  const canvasGridRef = useRef(null);
  const canvasDownCluesRef = useRef(null);

  const worker = createWorker({
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

  const fill_clues = (accross_clues: array, down_clues: array, grid: object) => {
    let grid_clues = grid.payload.clues

    down_clues.forEach(clue => {
      grid_clues.forEach(grid_clue => {
        if (grid_clue.direction == 1 && grid_clue.number == parseInt(clue.clueNumber)) {
          grid_clue.text = clue.clue
          grid_clue.lengths = clue.lengths.map(l => parseInt(l))
        }
      });
    });

    accross_clues.forEach(clue => {
      grid_clues.forEach(grid_clue => {
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
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    //@ts-ignore
    const ctxGrid = canvasGridRef.current.getContext("2d");
    const imageGrid = new Image();
    imageGrid.src = "./grid_image.png";

    let result = {}

    imageGrid.onload = async () => {


      ctxGrid.drawImage(imageGrid, 0, 0);
      let imgData = ctxGrid.getImageData(0, 0, 640, 425);
      console.log(imgData);
      console.log(
        imgData.data.reduce((sum: number, val: number) => {
          return sum + val;
        }, 0)
      );


      await cv
        .getGridFromImage(imgData)
        .then((res) => {
          console.log("Completed Promise");
          console.log(res);
          result = res
        })
        .catch((err) => {
          console.log("Error occurred trying to process image");
          console.log(err);
        });
    };

    //@ts-ignore
    const ctxClues = canvasDownCluesRef.current.getContext("2d");
    const downClues = new Image();
    downClues.src = "./down_clues.png";
    downClues.onload = async () => {
      ctxClues.drawImage(downClues, 0, 0);
      const {
        data: { text },
      } = await worker.recognize(downClues);
      console.log(`Text: ${text}`);

      // DEBUG
      let clues = extract_clues(text)
      console.log("Down clues:");
      console.log(clues)

      console.log("Grid data:")
      console.log(fill_clues([], clues, result.data));


    };
  }, []);

  return (
    <Layout>
      <>
        <div>
          <canvas ref={canvasGridRef} width={640} height={425} />
          <canvas ref={canvasDownCluesRef} width={640} height={425} />
        </div>
      </>
    </Layout>
  );
};

export default ImagePage;
