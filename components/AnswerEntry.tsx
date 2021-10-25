import React, { useState } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import LoadingButton from "@mui/lab/LoadingButton";
import { resolve } from "cypress/types/bluebird";

const apiUrl = "https://cryptic-solver-backend.herokuapp.com";

async function getExplanation(answer: string): Promise<any> {
  const response = await fetch(`${apiUrl}/TODO`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ answer }),
  });

  return await response.json();

  // return new Promise((resolve, reject) => {
  //   resolve({ explanations: ["test"] });
  // });
}

interface Props {
  setExplanationCallback?: any;
}

export default function AnswerEntry({ setExplanationCallback }: Props) {
  const KEYCODE_ENTER = 13;

  const [answer, setAnswer] = useState<string>("");
  const [searchedAnswer, setSearchedAnswer] = useState<string>("");
  const [explanations, setExplanations] = useState<Array<string>>([]);
  const [loadingExplanation, setLoadingExplanation] = useState(false);
  const [loadingError, setLoadingError] = useState(false);

  const handleAnswerInput = (e: any) => {
    setAnswer(e.target.value);
    setLoadingError(false);
  };

  const handleAnswerEntry = async (e: any) => {
    if (e.keyCode == KEYCODE_ENTER) {
      await fetchExplanations();
    }
  };

  const fetchExplanations = async () => {
    setLoadingExplanation(true);
    setLoadingError(false);
    setExplanations([]);

    await getExplanation(answer)
      .catch((error) => {
        console.log("There was an error trying to fetch explanations", error);
        setLoadingError(true);
      })
      .then((res) => {
        if (setExplanationCallback) {
          setExplanationCallback(res);
        } else {
          if (res?.explanations) {
            setExplanations(res.explanations);
            setSearchedAnswer(answer);
          }
        }
      })
      .finally(() => {
        setLoadingExplanation(false);
        setAnswer("");
      });
  };

  return (
    <Box maxWidth={400} style={{ margin: 16 }}>
      <Typography>
        Want to find an explanation for an answer?
        <br />
        Enter your answer here:
      </Typography>
      <Grid container direction="column">
        <Stack spacing={2} direction="row">
          <TextField
            label="Answer"
            fullWidth
            variant="standard"
            value={answer}
            data-cy="answer-input"
            onChange={handleAnswerInput}
            onKeyDown={handleAnswerEntry}
            error={loadingError}
            helperText={loadingError && "Sorry, an error has occurred"}
          />
          <LoadingButton
            loading={loadingExplanation}
            variant="contained"
            onClick={fetchExplanations}
          >
            {loadingExplanation ? "" : "Find!"}
          </LoadingButton>
        </Stack>
        {explanations?.length > 0 && (
          <Typography style={{ marginTop: 8 }}>
            Explanation for {searchedAnswer}: {explanations}
          </Typography>
        )}
      </Grid>
    </Box>
  );
}
