import ImageUpload from "@/components/ImageUpload";
import Layout from "@/components/_Layout";
import { Grid } from "@mui/material";
import { Button } from "@material-ui/core";
import { Box } from "@mui/system";
import { useState } from "react";
import ReactCrop from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";
import Image from "next/image";

export default function Upload() {
  const [srcImg, setSrcImg] = useState(null);
  const [image, setImage] = useState(null);
  const [crop, setCrop] = useState({ aspect: 4 / 3 });
  const [result, setResult] = useState(null);

  const getCroppedImg = async () => {
    try {
      const canvas = document.createElement("canvas");
      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(
        image,
        crop.x * scaleX,
        crop.y * scaleY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width,
        crop.height
      );

      const base64Image = canvas.toDataURL("image/jpeg", 1);

      setResult(base64Image);
    } catch (e) {
      console.log("crop the image");
    }
  };

  return (
    <Layout>
      <Grid
        container
        direction="column"
        justifyContent="center"
        alignItems="center"
        spacing={2}
      >
        <Grid item>
          <Button variant="contained" component="label">
            Upload image of a crossword
            <input
              type="file"
              name="crosswordImage"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setSrcImg(e.target.files[0]);
                } else {
                  console.log("Could not upload image, please try again");
                }
              }}
              hidden
            />
          </Button>
        </Grid>
        {srcImg && (
          <Grid item>
            <ReactCrop
              style={{ maxWidth: "30%" }}
              src={URL.createObjectURL(srcImg)}
              onImageLoaded={setImage}
              crop={crop}
              onChange={setCrop}
            />
          </Grid>
        )}
        {image && (
          <Grid item>
            <Button onClick={getCroppedImg}>crop</Button>
          </Grid>
        )}
        {result && (
          <Grid item>
            <Image src={result} height={100} width={100} />
          </Grid>
        )}
      </Grid>
      <Box mt={5}>
        {
          //TODO: make this button call image recognition function
        }
        <Button variant="contained">Process Images</Button>
      </Box>
    </Layout>
  );
}
