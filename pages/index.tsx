import type { NextPage } from "next";
import React, { useState } from "react";
import Layout from "@/components/_Layout";
import styles from "@/styles/Home.module.css";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/router";
import { useEffect } from "react";
import Link from "next/link";
import Card from "@mui/material/Card";
import { CardContent, Typography } from "@mui/material";
import Grid from "@mui/material/Grid";
import { Box } from "@mui/system";
import { Button, ButtonGroup } from "@material-ui/core";
import CircularProgress from "@material-ui/core/CircularProgress";
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
    <Layout>
      <>
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
      </>
    </Layout>
  );
};

export default Home;
