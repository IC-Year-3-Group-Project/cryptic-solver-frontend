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
import { getEveryman, getPuzzleById } from "@/components/Crossword/utils";
import { Paper } from "@mui/material";
import ButtonGroup from "@mui/material/ButtonGroup";

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
      setEverymanUrls((await getEveryman()).urls);
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
    try {
      if (crosswordID) {
        const puzzle = await getPuzzleById(crosswordID);
        router.push(`/crossword?raw=${JSON.stringify(puzzle.grid)}`);
      }
    } catch (e) {
      console.log("Error while fetching puzzle by id.", e);
    }
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
      <Grid
        container
        direction="column"
        spacing={4}
        justifyContent="center"
        alignItems="center"
      >
        <Grid
          item
          justifyContent="center"
          alignItems="center"
          direction="column"
          container
          xs={8}
          spacing={6}
        >
          <Grid item>
            <Typography
              variant="h1"
              className={styles.title}
              data-cy="title"
              noWrap
            >
              Cryptic Crossword Solver
            </Typography>

            <Typography variant="body1" className={styles.description}>
              Enter a link to an Everyman Guardian crossword:
            </Typography>
          </Grid>
          <Grid
            item
            container
            justifyContent="center"
            alignItems="center"
            direction="row"
            spacing={3}
          >
            <Grid item xs={8}>
              <TextField
                placeholder="Everyman link or Crossword Number"
                fullWidth
                variant="outlined"
                value={crosswordLink}
                data-cy="link-input"
                onChange={handleCrosswordLinkInput}
                onKeyDown={handleCrosswordLinkEntry}
              />
            </Grid>
            <Grid item>
              <LoadingButton
                variant="contained"
                onClick={fetchCrossword}
                data-cy="fetch-crossword-button"
              >
                Fetch!
              </LoadingButton>
            </Grid>
          </Grid>

          <Grid
            item
            container
            justifyContent="center"
            alignItems="center"
            direction="row"
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
        </Grid>

        <Grid
          item
          container
          direction="row"
          justifyContent="center"
          alignItems="flex-start"
          xs={12}
          spacing={2}
        >
          <Grid item>
            <Paper variant="outlined" sx={{ padding: 4 }}>
              <AnswerEntry />
            </Paper>
          </Grid>
          <Grid item>
            <Paper variant="outlined" sx={{ padding: 4 }}>
              <ButtonGroup orientation="vertical">
                <Button
                  variant="contained"
                  onClick={() => router.push("/upload")}
                >
                  Upload a crossword
                </Button>
                <Button
                  variant="contained"
                  onClick={() => router.push("/upload-backend")}
                >
                  Upload a crossword (Backend)
                </Button>
              </ButtonGroup>
            </Paper>
          </Grid>

          <Grid item>
            <Paper variant="outlined" sx={{ padding: 4 }}>
              <Typography>
                If you have a crossword ID, enter it here:
              </Typography>
              <TextField
                placeholder="Crossword ID"
                variant="outlined"
                onChange={handleCrosswordIDInput}
                onKeyDown={handleCrosswordIDEntry}
                sx={{ mt: 1 }}
                inputProps={{ inputMode: "numeric", pattern: "[0-9]*" }}
                fullWidth
              />
            </Paper>
          </Grid>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Home;
