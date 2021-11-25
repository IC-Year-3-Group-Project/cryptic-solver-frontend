import Layout from "@/components/_Layout";
import { useRouter } from "next/router";
import Grid from "@mui/material/Grid";
import Box from "@mui/system/Box";
import React, { useState } from "react";
import Typography from "@mui/material/Typography";
import LoadingButton from "@mui/lab/LoadingButton";
import { isMobile } from "react-device-detect";
import Modal from "@mui/material/Modal";
import Link from "next/link";
import CropFlow from "@/components/Cropping/CropFlow";
import {
  CrosswordUploadResponse,
  processPuzzle,
} from "@/components/Crossword/utils";
import { Puzzle } from "@/components/Crossword/model/Puzzle";
import Image from "next/image";
import { Dialog, DialogContent, DialogTitle } from "@mui/material";

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

export default function UploadBackend() {
  const router = useRouter();

  const [images, setImages] = useState<{ [key: string]: string }>({});
  const [loading, setLoading] = useState(false);

  const [processError, setProcessError] = useState(false);

  const [crosswordID, setCrosswordID] = useState<number>();
  const [open, setOpen] = useState(false);
  const [crossword, setCrossword] = useState<Puzzle>();

  async function uploadImages() {
    setLoading(true);
    try {
      const response = await processPuzzle(
        images.grid!.split(",")[1],
        images.across!.split(",")[1],
        images.down!.split(",")[1]
      );
      return response;
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <CropFlow
        stages={[
          { name: "grid", text: "Crop Grid" },
          { name: "across", text: "Crop Across Clues" },
          { name: "down", text: "Crop Down Clues" },
        ]}
        onComplete={(stages) => setImages(stages)}
      />
      <Box mt={2}>
        <LoadingButton
          variant="contained"
          loading={loading}
          disabled={!images.grid || !images.down || !images.across}
          onClick={async () => {
            const data = await uploadImages();
            console.log(data);
            if (data) {
              if (isMobile) {
                setCrosswordID(data.id);
                setOpen(true);
                setCrossword(data.grid);
              } else {
                router.push(`/crossword?raw=${JSON.stringify(data.grid)}`);
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
        <Box mt={2}>
          <Typography sx={{ color: "red" }}>
            Error processing crossword.{" "}
          </Typography>
        </Box>
      )}
      {crosswordID && (
        <Dialog open={crosswordID} fullWidth maxWidth="sm">
          <DialogTitle>Crossword Uploaded and Processed</DialogTitle>
          <DialogContent>
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
          </DialogContent>
        </Dialog>
      )}
    </Layout>
  );
}
