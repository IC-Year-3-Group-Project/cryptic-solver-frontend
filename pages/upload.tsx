import ImageUpload from "@/components/ImageUpload";
import Layout from "@/components/_Layout";
import { Grid } from "@mui/material";
import { Button } from "@material-ui/core";
import { Box } from "@mui/system";
import { useState } from "react";

export default function Upload() {
  const [gridImg, setGridImg] = useState(null);
  const [downImg, setDownImg] = useState(null);
  const [acrossImg, setAcrossImg] = useState(null);

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
            title={"Upload image of the across clues"}
            img={downImg}
            setImg={setDownImg}
          />
        </Grid>
        <Grid item>
          <ImageUpload
            title={"Upload image of the down clues"}
            img={acrossImg}
            setImg={setAcrossImg}
          />
        </Grid>
      </Grid>
      <Box mt={5}>
        {//TODO: make this button call image recognition function}
        <Button variant="contained">Process Images</Button>
      </Box>
    </Layout>
  );
}
