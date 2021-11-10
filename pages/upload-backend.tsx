import Layout from "@/components/_Layout";
import ImageUpload from "@/components/ImageUpload";
import { useRouter } from "next/router";
import Grid from "@mui/material/Grid";
import Button from "@mui/material/Button";
import Box from "@mui/system/Box";
import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { isMobile } from "react-device-detect";
import Modal from "@mui/material/Modal";
import Link from "next/link";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 400,
  bgcolor: "white",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

interface crosswordUploadResp {
  id: number;
  grid: any;
}

export default function UploadBackend() {
  const router = useRouter();

  const [gridImg, setGridImg] = useState<string>("");
  const [downImg, setDownImg] = useState<string>("");
  const [acrossImg, setAcrossImg] = useState<string>("");

  const [processError, setProcessError] = useState(false);

  const [crosswordID, setCrosswordID] = useState<number>();
  const [open, setOpen] = useState(false);
  const [crossword, setCrossword] = useState();

  async function uploadImages() {
    const settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mobile: false,
        grid: gridImg,
        across: acrossImg,
        down: downImg,
      }),
    };

    return await fetch(
      `https://cryptic-solver-backend.herokuapp.com/process-puzzle`,
      settings
    )
      .then(async (res) => {
        const data = await res.json();
        return data;
      })
      .catch((e) => {
        console.log("error waiting for response");
        return e;
      });
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
        <LoadingButton
          variant="contained"
          onClick={async () => {
            if (gridImg && downImg && acrossImg) {
              const data: crosswordUploadResp = await uploadImages();
              console.log(data);
              if (isMobile) {
                setCrosswordID(data["id"]);
                setOpen(true);
                setCrossword(data["grid"]);
              } else {
                router.push(`/crossword?raw=${JSON.stringify(data["grid"])}`);
              }
            } else {
              setProcessError(true);
            }
          }}
        >
          Process Images
        </LoadingButton>
      </Box>
      {processError && (
        <Box mt={5}>
          Please upload an image of a grid, across clues and down clues before
          clicking process
        </Box>
      )}
      {crosswordID && (
        <Modal open={open} onClose={() => setOpen(false)}>
          <Box>
            <Typography variant="h6">Crossword ID: {crosswordID}</Typography>
            <Typography sx={{ mt: 2 }}>
              Please enter this in on the home page on your computer
            </Typography>
            <Typography>
              Or if you want to continue on your phone,{" "}
              <Link href={`/crossword?raw=${JSON.stringify(crossword)}`}>
                <a>Click Here</a>
              </Link>
            </Typography>
          </Box>
        </Modal>
      )}
    </Layout>
  );
}
