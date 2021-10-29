import type { NextPage } from "next";
import React, { useEffect, useRef } from "react";
import Layout from "@/components/_Layout";
import styles from "@/styles/Home.module.css";
import cv from "../services/cv";

//@ts-ignore
const ImagePage: NextPage = () => {
  const canvasRef = useRef(null);

  //@ts-ignore
  useEffect(async () => {
    console.log("loading...");
    await cv.load();
    //@ts-ignore
    const ctx = canvasRef.current.getContext("2d");
    const image = new Image();
    image.src = "./image.png";
    image.onload = async () => {
      ctx.drawImage(image, 0, 0);
      let imgData = ctx.getImageData(0, 0, 640, 425);
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
        })
        .catch((err) => {
          console.log("Error occurred trying to process image");
          console.log(err);
        });
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
