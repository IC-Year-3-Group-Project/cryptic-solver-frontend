import Typography from "@mui/material/Typography";
import Box from "@mui/system/Box";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import ImageCrop, { Rect } from "./ImageCrop";

export interface CropStage {
  name: string;
  text: string;
}

export interface CropFlowProps {
  url?: string;
  stages: CropStage[];
  urlType?: "data" | "blob";
  onComplete: (cropped: { [key: string]: string }) => void;
}

export default function CropFlow(props: CropFlowProps) {
  const { url, stages, onComplete } = props;

  const [imageUrl, setImageUrl] = useState(url);
  const [stage, setStage] = useState(0);
  const [results, setResults] = useState<{ [key: string]: string }>({});
  const [currentUrl, setCurrentUrl] = useState<string>();
  const [reset, setReset] = useState(false);

  function triggerReset() {
    setReset(!reset);
  }

  function onStageCrop(url: string, rect: Rect) {
    setCurrentUrl(url);
  }

  function onStageConfirmed() {
    if (currentUrl) {
      results[stages[stage].name] = currentUrl;
      setResults(results);
      if (stage == stages.length - 1) {
        onComplete(results);
      }
      setStage(stage + 1);

      triggerReset();
    }
  }

  useEffect(() => {
    if (!imageUrl) {
      setCurrentUrl(undefined);
      setStage(0);
    }
  }, [imageUrl]);

  return (
    <Box sx={{ display: "flex", flexDirection: "row", alignItems: "center" }}>
      {imageUrl && stage < stages.length && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <Typography variant="h4">{stages[stage].text}</Typography>
          <ImageCrop
            url={imageUrl}
            onCrop={onStageCrop}
            onCropReset={() => setCurrentUrl(undefined)}
            reset={reset}
          ></ImageCrop>
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              justifyContent: "flex-start",
            }}
          >
            <Button
              variant="contained"
              color="secondary"
              onClick={() => setImageUrl(undefined)}
            >
              Cancel
            </Button>
            {currentUrl && (
              <Button
                variant="contained"
                onClick={onStageConfirmed}
                sx={{ ml: 2 }}
              >
                Confirm
              </Button>
            )}
          </Box>
        </Box>
      )}
      {imageUrl && stage >= stages.length && (
        <Typography>Cropped {stages.length} images!</Typography>
      )}
      {!imageUrl && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minWidth: 200,
          }}
        >
          <Typography sx={{ mb: 2 }}>No image loaded.</Typography>
          <Button variant="contained" component="label">
            <input
              type="file"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setImageUrl(URL.createObjectURL(e.target.files[0]));
                } else {
                  console.log("Could not upload image, please try again");
                }
              }}
              hidden
            />
            Upload
          </Button>
        </Box>
      )}
    </Box>
  );
}
