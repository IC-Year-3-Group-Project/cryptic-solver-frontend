import Image from "next/image";
import { Box } from "@mui/system";
import Button from "@mui/material/Button";
import { Grid } from "@mui/material";

interface Props {
  title: string;
  img: any;
  setImg: any;
}

export default function ImageUpload({ title, img, setImg }: Props) {
  return (
    <Grid
      container
      direction="column"
      justifyContent="center"
      alignItems="center"
    >
      {img && (
        <Grid item>
          <Image src={URL.createObjectURL(img)} width={250} height={250} />
        </Grid>
      )}
      <Grid item>
        <Button variant="contained" component="label">
          {title}
          <input
            type="file"
            name="myImg"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                setImg(e.target.files[0]);
              } else {
                console.log("Could not upload image, please try again");
              }
            }}
            hidden
          />
        </Button>
      </Grid>
    </Grid>
  );
}
