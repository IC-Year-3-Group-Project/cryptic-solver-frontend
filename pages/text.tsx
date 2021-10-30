import type { NextPage } from "next";
import React, { useEffect, useRef } from "react";
import Layout from "@/components/_Layout";
import styles from "@/styles/Home.module.css";
import Tesseract from "tesseract.js";
import tess from "../services/tess"

//@ts-ignore
const ImagePage: NextPage = () => {
  const canvasRef = useRef(null);

  //@ts-ignore
  useEffect(async () => {
    console.log("loading...");
    await tess.load();
    //@ts-ignore
    const ctx = canvasRef.current.getContext("2d");
    const image = new Image();
    image.src = "https://tesseract.projectnaptha.com/img/eng_bw.png";
    image.onload = async () => {
      ctx.drawImage(image, 0, 0);
      let imgData = ctx.getImageData(0, 0, 640, 425);
      console.log(imgData);
      console.log(
        imgData.data.reduce((sum: number, val: number) => {
          return sum + val;
        }, 0)
      );
      // await tess.loadLanguage('eng');
      // await tess.initialize('eng');
      const text = tess.recognize_text(image.src);
      console.log(text);
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