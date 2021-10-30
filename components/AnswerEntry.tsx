import React, { useState, useReducer, Reducer } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import LoadingButton from "@mui/lab/LoadingButton";
import { resolve } from "cypress/types/bluebird";

const apiUrl = "https://cryptic-solver-backend.herokuapp.com";

async function getExplanation(answer: object): Promise<any> {
  const response = await fetch(`${apiUrl}/explain_answer`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(answer),
  });

  return await response.json();

  // return new Promise((resolve, reject) => {
  //   resolve({ explanations: "test"]});
  // });
}

interface Props {
  setExplanationCallback?: any;
}

export default function AnswerEntry({ setExplanationCallback }: Props) {
  const KEYCODE_ENTER = 13;

  const validators: {
    [key: string]: any;
  } = {
    answer: (value: string) => {
      if (value?.length > 0) {
        return [false, ""];
      }
      return [true, "Answer mustn't be empty"];
    },
    clue: (value: string) => {
      if (value?.length > 0) {
        return [false, ""];
      }
      return [true, "Clue mustn't be empty"];
    },
    word_length: (value: number) => {
      if (value > 0) {
        return [false, ""];
      }
      return [true, "Length must be positive"];
    },
  };

  const [explanationSearch, setExplanationSearch] = useReducer<
    Reducer<any, any>
  >((state: object, newState: object) => ({ ...state, ...newState }), {
    answer: "",
    clue: "",
    word_length: "",
  });
  const [loadingExplanationError, setLoadingExplanationError] = useReducer<
    Reducer<any, any>
  >((state: object, newState: object) => ({ ...state, ...newState }), {
    answer: false,
    clue: false,
    word_length: false,
  });
  const [loadingExplanationErrorMessages, setLoadingExplanationErrorMessages] =
    useReducer<Reducer<any, any>>(
      (state: object, newState: object) => ({ ...state, ...newState }),
      {
        answer: "",
        clue: "",
        word_length: false,
      }
    );
  const [searchedExplanation, setSearchedExplanation] = useState<any>({});
  const [explanation, setExplanation] = useState<string>("");
  const [loadingExplanation, setLoadingExplanation] = useState(false);

  const handleExplanationSearchInput = (e: any) => {
    setExplanationSearch({ [e.target.name]: e.target.value });
    const [error, errorMessage] = validators[e.target.name](e.target.value);
    setLoadingExplanationError({ [e.target.name]: error });
    setLoadingExplanationErrorMessages({ [e.target.name]: errorMessage });
  };

  const handleExplanationSearchEntry = async (e: any) => {
    if (e.keyCode == KEYCODE_ENTER) {
      await fetchExplanation();
    }
  };

  const validateSearch = () => {
    let hasError = false;
    for (const key in validators) {
      const [error, errorMessage] = validators[key](explanationSearch[key]);
      setLoadingExplanationError({ [key]: error });
      setLoadingExplanationErrorMessages({ [key]: errorMessage });
      hasError ||= error;
    }
    return !hasError;
  };

  const fetchExplanation = async () => {
    setSearchedExplanation({});
    setExplanation("");
    if (!validateSearch()) {
      return;
    }

    setLoadingExplanation(true);
    await getExplanation(explanationSearch)
      .catch((error) => {
        console.log("There was an error trying to fetch explanations", error);
        setLoadingExplanationError({
          answer: true,
          clue: true,
          word_length: true,
        });
      })
      .then((res) => {
        if (setExplanationCallback) {
          setExplanationCallback(res);
        } else {
          setSearchedExplanation(explanationSearch);
          setExplanation(res.explanations);
          if (res?.explanations) {
            setExplanationSearch({
              answer: "",
              clue: "",
              word_length: 0,
            });
          }
        }
      })
      .finally(() => {
        setLoadingExplanation(false);
      });
  };

  return (
    <Box maxWidth={400} style={{ margin: 16 }}>
      <Typography style={{ marginBottom: 16 }}>
        Want to find an explanation for an answer?
        <br />
        Enter your answer and clue here:
      </Typography>
      <Grid container direction="column">
        <Stack spacing={2} direction="row">
          <TextField
            label="Answer"
            fullWidth
            variant="standard"
            value={explanationSearch.answer}
            data-cy="answer-input"
            onChange={handleExplanationSearchInput}
            onKeyDown={handleExplanationSearchEntry}
            name="answer"
            error={loadingExplanationError.answer}
            helperText={
              loadingExplanationError.answer &&
              (loadingExplanationErrorMessages.answer ||
                "Sorry, an error has occurred")
            }
          />
          <TextField
            label="Clue"
            fullWidth
            variant="standard"
            value={explanationSearch.clue}
            data-cy="clue-input"
            onChange={handleExplanationSearchInput}
            onKeyDown={handleExplanationSearchEntry}
            name="clue"
            error={loadingExplanationError.clue}
            helperText={
              loadingExplanationError.clue &&
              (loadingExplanationErrorMessages.clue ||
                "Sorry, an error has occurred")
            }
          />
          <TextField
            label="Length"
            type="number"
            fullWidth
            variant="standard"
            value={explanationSearch.word_length}
            data-cy="length-input"
            onChange={handleExplanationSearchInput}
            onKeyDown={handleExplanationSearchEntry}
            name="word_length"
            error={loadingExplanationError.word_length}
            helperText={
              loadingExplanationError.word_length &&
              (loadingExplanationErrorMessages.word_length ||
                "Sorry, an error has occurred")
            }
          />
          <LoadingButton
            loading={loadingExplanation}
            variant="contained"
            onClick={fetchExplanation}
          >
            {loadingExplanation ? "" : "Find!"}
          </LoadingButton>
        </Stack>
        {!setExplanationCallback &&
          searchedExplanation &&
          Object.keys(searchedExplanation).length > 0 && (
            <Typography style={{ marginTop: 8 }} data-cy="explanation">
              {explanation
                ? `Explanation for ${searchedExplanation.clue}: ${explanation}`
                : `No explanation found for: ${searchedExplanation.clue}`}
            </Typography>
          )}
      </Grid>
    </Box>
  );
}
