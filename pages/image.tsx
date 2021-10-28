import type { NextPage } from "next";
import React, { useState, useEffect, useRef } from "react";
import Layout from "@/components/_Layout";
import styles from "@/styles/Home.module.css";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/router";
import { CardContent, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Box } from "@mui/system";
import { Button, ButtonGroup } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
import AnswerEntry from "@/components/AnswerEntry";
import cv from "../services/cv";
// import { getGridFromImage } from "../image_recognition/recognition.js";
// import Image from "next/image";

//@ts-ignore
const ImagePage: NextPage = () => {
  const router = useRouter();

  const canvasRef = useRef(null);

  //@ts-ignore
  useEffect(async () => {
    console.log("loading");
    await cv.load();
    //@ts-ignore
    const ctx = canvasRef.current.getContext("2d");
    //@ts-ignore
    console.log(canvasRef);
    console.log(ctx);

    const image = new Image();
    image.src = "./image.png";
    image.onload = async () => {
      ctx.drawImage(image, 0, 0);
      let imgData = ctx.getImageData(0, 0, 640, 425);
      console.log(imgData);
      let count = 0;
      imgData.data.map((data) => {
        count += data;
      });
      console.log(count);
      let x = await cv.getGridFromImage(imgData).then((res) => {
        console.log("Completed Promise");
        console.log(res);
      });
      console.log("Complete");
      console.log(x);
    };
  }, []);

  return (
    <Layout>
      <>
        <div>
          hi
          <canvas ref={canvasRef} width={640} height={425} />
        </div>
      </>
    </Layout>
  );
};

export default ImagePage;
