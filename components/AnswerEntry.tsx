import React, { useState, useReducer, Reducer } from "react";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import LoadingButton from "@mui/lab/LoadingButton";

const apiUrl = "https://cryptic-solver-backend.herokuapp.com";

async function getExplanation(explanationSearch: {
  [key: string]: any;
}): Promise<any> {
  const lowerCaseExplanationSearch = Object.keys(explanationSearch).reduce(
    (
      loweredCase: {
        [key: string]: any;
      },
      key: any
    ) => (
      (loweredCase[key] = explanationSearch[key].toLowerCase()), loweredCase
    ),
    {}
  );
  lowerCaseExplanationSearch["word_length"] = explanationSearch.answer.length;
  const response = await fetch(`${apiUrl}/explain_answer`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(lowerCaseExplanationSearch),
  });

  return await response.json();
}

interface Props {
  setExplanationCallback?: any;
}

export default function AnswerEntry({ setExplanationCallback }: Props) {
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
  };

  const [explanationSearch, setExplanationSearch] = useReducer<
    Reducer<any, any>
  >((state: object, newState: object) => ({ ...state, ...newState }), {
    answer: "",
    clue: "",
  });
  const [loadingExplanationError, setLoadingExplanationError] = useReducer<
    Reducer<any, any>
  >((state: object, newState: object) => ({ ...state, ...newState }), {
    answer: false,
    clue: false,
  });
  const [loadingExplanationErrorMessages, setLoadingExplanationErrorMessages] =
    useReducer<Reducer<any, any>>(
      (state: object, newState: object) => ({ ...state, ...newState }),
      {
        answer: "",
        clue: "",
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
      .then((res) => {
        if (setExplanationCallback) {
          setExplanationCallback(res);
        } else {
          setSearchedExplanation(explanationSearch);
          setExplanation(res);
          if (res) {
            setExplanationSearch({
              answer: "",
              clue: "",
            });
          }
        }
      })
      .catch((error) => {
        console.log("There was an error trying to fetch explanations", error);
        setLoadingExplanationError({
          answer: true,
          clue: true,
        });
      })
      .finally(() => {
        setLoadingExplanation(false);
      });
  };

  return (
    <Grid container spacing={2} direction="column">
      <Grid item>
        <Typography gutterBottom>
          Want to find an explanation for an answer?
          <br />
          Enter your answer and clue here:
        </Typography>
      </Grid>
      <Grid item>
        <TextField
          label="Answer"
          fullWidth
          variant="outlined"
          value={explanationSearch.answer}
          data-cy="answer-input"
          onChange={handleExplanationSearchInput}
          name="answer"
          error={loadingExplanationError.answer}
          helperText={
            loadingExplanationError.answer &&
            (loadingExplanationErrorMessages.answer ||
              "Sorry, an error has occurred")
          }
        />
      </Grid>
      <Grid item>
        <TextField
          label="Clue"
          fullWidth
          multiline
          maxRows={4}
          variant="outlined"
          value={explanationSearch.clue}
          data-cy="clue-input"
          onChange={handleExplanationSearchInput}
          name="clue"
          error={loadingExplanationError.clue}
          helperText={
            loadingExplanationError.clue &&
            (loadingExplanationErrorMessages.clue ||
              "Sorry, an error has occurred")
          }
        />
        {!setExplanationCallback &&
          searchedExplanation &&
          Object.keys(searchedExplanation).length > 0 && (
            <Typography
              style={{ marginTop: 24 }}
              data-cy="explanation-description"
            >
              {explanation ? (
                <>
                  {`Explanation for ${searchedExplanation.clue}:`}
                  <Typography style={{ marginTop: 12 }} data-cy="explanation">
                    {`${explanation}`}
                  </Typography>
                </>
              ) : (
                `No explanation found for: ${searchedExplanation.clue}`
              )}
            </Typography>
          )}
      </Grid>
      <Grid item>
        <LoadingButton
          loading={loadingExplanation}
          variant="contained"
          onClick={fetchExplanation}
          data-cy="find-explanation-button"
        >
          {loadingExplanation ? "" : "Find!"}
        </LoadingButton>
      </Grid>
    </Grid>
  );
}
