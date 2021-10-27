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
// import "../image_recognition/opencv.js";
// import { getGridFromImage } from "../image_recognition/recognition.js";
// import Image from "next/image";

//@ts-ignore
const ImagePage: NextPage = () => {
  const router = useRouter();

  const canvasRef = useRef(null);

  //@ts-ignore
  useEffect(() => {
    //@ts-ignore
    const ctx = canvasRef.current.getContext("2d");
    //@ts-ignore
    const image = new Image();
    console.log(canvasRef);
    console.log(ctx);
    image.src = "./image.png";
    image.onload = () => {
      ctx.drawImage(image, 0, 0);
      let imgData = ctx.getImageData(0, 0, 640, 425);
      console.log(imgData);
      let count = 0;
      imgData.data.map((data) => {
        count += data;
      });
      console.log(count);
    //   getGridFromImage(imgData);
    };
  }, []);

  //   useEffect(() => {
  //     //@ts-ignore
  //     const ctx = canvasRef.current.getContext("2d");
  //     //@ts-ignore
  //     let imgData = ctx.getImageData(0, 0, 640, 425);
  //     console.log(imgData);
  //     let count = 0;
  //     imgData.data.map((data) => {
  //       count += data;
  //     });
  //     console.log(count);
  //   }, [canvasRef]);

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
