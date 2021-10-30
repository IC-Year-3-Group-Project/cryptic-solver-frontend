import type { NextPage } from "next";
import React, { useEffect, useRef } from "react";
import Layout from "@/components/_Layout";
import styles from "@/styles/Home.module.css";
import { createWorker } from "tesseract.js";

//@ts-ignore
const ImagePage: NextPage = () => {
  const canvasRef = useRef(null);

  const worker = createWorker({
    logger: (m) => console.log(m),
  });

  // this function doesn't really work yet, I think it has an infinite loop
  const extract_clues = (text: string) => {
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
