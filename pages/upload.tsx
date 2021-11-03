import ImageUpload from "@/components/ImageUpload";
import Layout from "@/components/_Layout";
import { Grid } from "@mui/material";
import { Button } from "@material-ui/core";
import { Box } from "@mui/system";
import React, { useState, useEffect } from "react";
import cv from "../services/cv";
import { createWorker } from "tesseract.js";

export default function Upload() {
  const [gridImg, setGridImg] = useState<string>("");
  const [downImg, setDownImg] = useState<string>("");
  const [acrossImg, setAcrossImg] = useState<string>("");
  const [acrossLoaded, setAcrossLoaded] = useState(false);
  const [downLoaded, setDownLoaded] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [acrossClues, setAcrossClues] = useState([]);
  const [downClues, setDownClues] = useState([]);
  const [grid, setGrid] = useState({});

  const workerAcross = createWorker({
    logger: (m: any) => {},
  });

  const workerDown = createWorker({
    logger: (m: any) => {},
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
    let grid_clues = grid.payload.clues;

    down_clues.forEach(
      (clue: { clueNumber: string; clue: any; lengths: any[] }) => {
        grid_clues.forEach(
          (grid_clue: {
            direction: number;
            number: number;
            text: any;
            lengths: any;
          }) => {
            if (
              grid_clue.direction === 1 &&
              grid_clue.number === parseInt(clue.clueNumber)
            ) {
              grid_clue.text = clue.clue;
              grid_clue.lengths = clue.lengths.map((l) => parseInt(l));
            }
          }
        );
      }
    );

    across_clues.forEach(
      (clue: { clueNumber: string; clue: any; lengths: any[] }) => {
        grid_clues.forEach(
          (grid_clue: {
            direction: number;
            number: number;
            text: any;
            lengths: number[];
          }) => {
            if (
              grid_clue.direction === 0 &&
              grid_clue.number === parseInt(clue.clueNumber)
            ) {
              grid_clue.text = clue.clue;
              grid_clue.lengths = clue.lengths.map((l) => parseInt(l));
            }
          }
        );
      }
    );

    return grid;
  };

  const handle_process = async () => {
    console.log("loading...");
    await cv.load();
    await workerAcross.load();
    await workerAcross.loadLanguage("eng");
    await workerAcross.initialize("eng");
    await workerDown.load();
    await workerDown.loadLanguage("eng");
    await workerDown.initialize("eng");

    const acrossImage = new Image();
    acrossImage.src = acrossImg;
    acrossImage.onload = async () => {
      const {
        data: { text },
      } = await workerDown.recognize(acrossImage);
      console.log(`Text: ${text}`);

      let across_clues = extract_clues(text);
      setAcrossClues(across_clues);
      setAcrossLoaded(true);
    };

    const downImage = new Image();
    downImage.src = downImg;
    downImage.onload = async () => {
      const {
        data: { text },
      } = await workerAcross.recognize(downImage);
      console.log(`Text: ${text}`);

      let down_clues = extract_clues(text);
      setDownClues(down_clues);
      setDownLoaded(true);
    };

    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const gridImage = new Image();
    gridImage.src = gridImg;
    gridImage.onload = async () => {
      canvas.width = gridImage.width;
      canvas.height = gridImage.height;
      //@ts-ignore
      context.drawImage(gridImage, 0, 0);
      //@ts-ignore
      let imgData = context.getImageData(
        0,
        0,
        gridImage.width,
        gridImage.height
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
  };

  //@ts-ignore
  useEffect(async () => {
    if (acrossLoaded && downLoaded && imageLoaded) {
      console.log(fill_clues(acrossClues, downClues, grid.data));
    }
  }, [acrossLoaded, downLoaded, imageLoaded]);

  return (
    <Layout>
      <Grid
        container
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <Grid item>
          <ImageUpload
            title={"Upload image of the grid"}
            img={gridImg}
            setImg={setGridImg}
          />
        </Grid>
        <Grid item>
          <ImageUpload
            title={"Upload image of the down clues"}
            img={downImg}
            setImg={setDownImg}
          />
        </Grid>
        <Grid item>
          <ImageUpload
            title={"Upload image of the across clues"}
            img={acrossImg}
            setImg={setAcrossImg}
          />
        </Grid>
      </Grid>
      <Box mt={5}>
        {
          //TODO: make this button call image recognition function
        }
        <Button variant="contained" onClick={handle_process}>
          Process Images
        </Button>
      </Box>
    </Layout>
  );
}
