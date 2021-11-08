import Layout from "@/components/_Layout";
import ImageUpload from "@/components/ImageUpload";
import { useRouter } from "next/router";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Box from "@mui/system/Box";
import React, { useState } from "react";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

export default function UploadBackend() {
  const router = useRouter();

  const [gridImg, setGridImg] = useState<string>("");
  const [downImg, setDownImg] = useState<string>("");
  const [acrossImg, setAcrossImg] = useState<string>("");

  async function uploadImages() {
    const settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    };

    try {
      //todo: replace google with actual api url
      const fetchResponse = await fetch(`http://www.google.com`, settings);
      const data = await fetchResponse.json();
      return data;
    } catch (e) {
      return e;
    }
  }

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
        <LoadingButton variant="contained">Process Images</LoadingButton>
      </Box>
    </Layout>
  );
}
