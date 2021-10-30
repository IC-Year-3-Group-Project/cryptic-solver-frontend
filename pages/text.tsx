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
    image.src = "./eng_bw.png";
    image.onload = async () => {
      ctx.drawImage(image, 0, 0);
      const {
        data: { text },
      } = await worker.recognize(image);
      console.log(`Text: ${text}`);
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
