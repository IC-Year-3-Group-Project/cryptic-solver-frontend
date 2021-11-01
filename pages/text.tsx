import type { NextPage } from "next";
import React, { useEffect, useRef } from "react";
import Layout from "@/components/_Layout";
import styles from "@/styles/Home.module.css";
import { createWorker } from "tesseract.js";
import { split } from "cypress/types/lodash";

//@ts-ignore
const ImagePage: NextPage = () => {
  const canvasRef = useRef(null);

  const worker = createWorker({
    logger: (m) => console.log(m),
  });

  const preprocess = (text: string) => {
    // Preprocess weird characters
    let character_replacements = new Map([
      ["©","(5)"],
      ["|", "I"],
      ["®", "(5"]
    ]);

    character_replacements.forEach((replacement, key) => {
      text = text.replace(key, replacement)
    });

    // Take care of cases where the lengths of a two-word clue have been stuck together
    for (let i = 0; i < text.length - 2; i++) {
      if (text.charAt(i) == '(' && text.charAt(i + 1) > '1' && text.charAt(i + 1) <= '9'
          && text.charAt(i + 2) >= '1' && text.charAt(i + 2) <= '9') {
        text = text.substring(0, i + 2) + "," + text.substring(i + 2, text.length)
      }

    }

    return text
  }

  const extract_clues = (text: string) => {

    text = preprocess(text)

    let parts = text.split("\n\n");
    let clues = [];

    for (let part of parts) {
      let part_new = part.replace(/\n/g, "");
      let front = part_new;
      let lengths: string[] = [];

      if (part.includes("(")) {
        let splittedPart = part_new.split("(");
        front = splittedPart[0];
        let lengthsWithComma = splittedPart[1].substring(0, splittedPart[1].length - 1);

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
      let clue = front.substring(i + 1, );

      clues.push({
        clueNumber: number,
        clue: clue,
        lengths: lengths
      });
    }
    return clues;

  }

  // this function doesn't really work yet, I think it has an infinite loop
  // we might want to use something similar because of the bugs that
  // tesseract causes and thus problems with splitting
  const extract_clues_old = (text: string) => {
    text = text.substring(6,)
    let inClue = false
    let inBrackets = false
    let clue = ""
    let clues = []
    let lengths = []
    let clueNumber = ""
    let i = 0
    while (i < text.length){
      let character = text[i]
      if (character == "\n"){
        i++;
        continue;
      }
      if(inBrackets) {
        i++;
        if (character == ")"){
          inBrackets = false;
          clues.push({clueNumber: clueNumber,
                      clue: clue,
                      lenghts: lengths,
                      direction: 0});
          clueNumber = ""
          lengths = []
          clue = ""
          continue;
        } else if (character == ",") {
          continue;
        } else {
          lengths.push(character)
          continue;
        }
      } else if(inClue){
        clue = clue.concat("", character);
        if (text[i+2] != "(") {
          inClue = false;
          i++;
        }else{
          i = i + 2
        }
      } else if (character == " "){
        i++;
        continue;
      } else if (character == "("){
        inBrackets = true;
        i++;
        continue;
      } else {
        clueNumber = clueNumber.concat("", character)
        if(text[i + 1] == " ") {
          inClue = true;
          i = i + 2;
        } else{
          i++;
        }
      }
    }
    console.log(clues)
  }

  //@ts-ignore
  useEffect(async () => {
    console.log("loading...");
    await worker.load();
    await worker.loadLanguage("eng");
    await worker.initialize("eng");
    //@ts-ignore
    const ctx = canvasRef.current.getContext("2d");
    const image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = "./text1.png";
    image.onload = async () => {
      ctx.drawImage(image, 0, 0);
      const {
        data: { text },
      } = await worker.recognize(image);
      console.log(`Text: ${text}`);
      console.log(extract_clues(text))
    };
  }, []);

  return (
    <Layout>
      <>
        <div>
          <canvas ref={canvasRef} width={640} height={425} />
        </div>
      </>
    </Layout>
  );
};

export default ImagePage;
