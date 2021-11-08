import Image from "next/image";
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid";
import { Typography } from "@mui/material";
import { Box } from "@mui/system";

interface Props {
  title: string;
  img: any;
  setImg: any;
}

export default function ImageUpload({ title, img, setImg }: Props) {
  return (
    <Box sx={{ border: "1px dashed grey", padding: "5px" }}>
      <Grid
        container
        direction="column"
        justifyContent="end"
        alignItems="center"
        minHeight={300}
        minWidth={300}
      >
        {img && (
          <Grid item>
            <img src={img} width={250} height={250} style={{ width: "auto" }} />
          </Grid>
        )}
        {!img && <Typography sx={{ mb: "125px" }}>No image</Typography>}
        <Grid item>
          <Button variant="contained" component="label">
            {title}
            <input
              type="file"
              name="myImg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImg(URL.createObjectURL(e.target.files[0]));
                } else {
                  console.log("Could not upload image, please try again");
                }
              }}
              hidden
            />
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
}
