import type { NextPage } from "next";
import React, { useState } from "react";
import Layout from "@/components/_Layout";
import styles from "@/styles/Home.module.css";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Box from "@mui/system/Box";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import AnswerEntry from "@/components/AnswerEntry";
import LoadingButton from "@mui/lab/LoadingButton";

const apiUrl = "https://cryptic-solver-backend.herokuapp.com";

async function getEveryman(): Promise<String[]> {
  const response = await fetch(`${apiUrl}/fetch-everyman`, {
    method: "GET",
  });

  const data = await response.json();
  return data["urls"];
}

const Home: NextPage = () => {
  const KEYCODE_ENTER = 13;
  const EVERYMAN_URL = "https://www.theguardian.com/crosswords/everyman/";

  const router = useRouter();
  const [loadingEveryman, setLoadingEveryman] = useState(true);
  const [crosswordLink, setCrosswordLink] = useState<String>("");
  const [everymanUrls, setEverymanUrls] = useState<Array<String>>([]);
  const [crosswordID, setCrosswordID] = useState<number>();

  useEffect(() => {
    const fetchEveryman = async (): Promise<any> => {
      setEverymanUrls(await getEveryman());
      setLoadingEveryman(false);
    };

    fetchEveryman();
  }, []);

  const handleCrosswordLinkInput = (e: any) => {
    setCrosswordLink(e.target.value);
  };

  const handleCrosswordLinkEntry = async (e: any) => {
    if (e.keyCode == KEYCODE_ENTER) {
      fetchCrossword();
    }
  };

  const handleCrosswordIDInput = (e: any) => {
    setCrosswordID(parseInt(e.target.value));
  };

  const handleCrosswordIDEntry = async (e: any) => {
    if (e.keyCode == KEYCODE_ENTER) {
      fetchCrosswordFromID();
    }
  };

  async function fetchCrosswordFromID() {
    const settings = {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        id: crosswordID,
      }),
    };

    await fetch(
      `https://cryptic-solver-backend.herokuapp.com/get-puzzle`,
      settings
    )
      .then(async (res) => {
        const data = await res.json();
        router.push(`/crossword?raw=${data["grid"]}`);
      })
      .catch((e) => {
        return e;
      });
  }

  const fetchCrossword = async () => {
    // Navigate to crossword page.
    if ("0" <= crosswordLink.charAt(0) && crosswordLink.charAt(0) <= "9") {
      router.push(`/crossword?url=${EVERYMAN_URL}${crosswordLink}`);
    } else {
      router.push(`/crossword?url=${crosswordLink}`);
    }
    setCrosswordLink("");
  };

  return (
    <Layout home>
      <h1 className={styles.title} data-cy="title">
        Cryptic Crossword Solver
      </h1>

      <p className={styles.description}>
        Enter a link to an Everyman Guardian crossword:
      </p>

      <TextField
        label="Everyman link or Crossword Number"
        fullWidth
        style={{ marginBottom: 16 }}
        variant="standard"
        value={crosswordLink}
        data-cy="link-input"
        onChange={handleCrosswordLinkInput}
        onKeyDown={handleCrosswordLinkEntry}
      />
      <LoadingButton
        variant="contained"
        onClick={fetchCrossword}
        data-cy="fetch-crossword-button"
      >
        Fetch!
      </LoadingButton>

      <Box mt={5}>
        <Grid
          container
          direction="row"
          justifyContent="center"
          alignItems="center"
          spacing={2}
        >
          <Grid item>
            <Typography variant="h6">Crosswords to try:</Typography>
          </Grid>

          {loadingEveryman && (
            <Grid item>
              <CircularProgress size={20} />
            </Grid>
          )}

          {!loadingEveryman &&
            everymanUrls.slice(0, 5).map((url, i) => {
              return (
                <Grid item key={i}>
                  <Button
                    variant="outlined"
                    href={"/crossword?url=" + url}
                    data-cy="crossword-link"
                  >
                    #
                    {url.replace(
                      "https://www.theguardian.com/crosswords/everyman/",
                      ""
                    )}
                  </Button>
                </Grid>
              );
            })}
        </Grid>
      </Box>

      <Box mt={5}>
        <AnswerEntry />
      </Box>

      <Box mt={5}>
        <Button variant="contained" onClick={() => router.push("/upload")}>
          Click to upload a crossword from an image
        </Button>
      </Box>

      <Box mt={5}>
        <Button
          variant="contained"
          onClick={() => router.push("/upload-backend")}
        >
          Click to upload a crossword from an image (Backend)
        </Button>
      </Box>

      <Box mt={5}>
        <Typography>If you have a crossword ID, enter it here:</Typography>
        <TextField
          placeholder="Crossword ID"
          variant="outlined"
          onChange={handleCrosswordIDInput}
          onKeyDown={handleCrosswordIDEntry}
          sx={{ mt: 1 }}
          inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
          fullWidth
        />
      </Box>
    </Layout>
  );
};

export default Home;
