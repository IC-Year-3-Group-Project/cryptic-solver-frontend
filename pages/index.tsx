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

  const router = useRouter();
  const [crosswordLink, setCrosswordLink] = useState<String>("");
  const [everymanUrls, setEverymanUrls] = useState<Array<String>>([]);

  useEffect(() => {
    const fetchEveryman = async (): Promise<any> => {
      setEverymanUrls(await getEveryman());
    };

    fetchEveryman();
  }, []);

  const handleCrosswordLinkInput = (e: any) => {
    setCrosswordLink(e.target.value);
  };

  const handleCrosswordLinkEntry = async (e: any) => {
    if (e.keyCode == KEYCODE_ENTER) {
      // Navigate to crossword page.
      router.push(`/crossword?url=${crosswordLink}`);
      setCrosswordLink("");
    }
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
          label="Everyman link"
          fullWidth
          variant="standard"
          value={crosswordLink}
          data-cy="link-input"
          onChange={handleCrosswordLinkInput}
          onKeyDown={handleCrosswordLinkEntry}
        />

        <Box mt={5}>
          <Grid
            item
            container
            direction="row"
            justifyContent="center"
            alignItems="center"
            spacing={2}
          >
            <Grid item>
              <Typography variant="h6">Crosswords to try:</Typography>
            </Grid>

            {everymanUrls.slice(0, 5).map((url: String) => {
              return (
                <Grid item>
                  <Card variant="outlined">
                    <CardContent>
                      <Link href={apiUr + "/crossword?url=" + url}>
                        <a data-cy="crossword-link">
                          #
                          {url.replace(
                            "https://www.theguardian.com/crosswords/everyman/",
                            ""
                          )}
                        </a>
                      </Link>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </>
    </Layout>
  );
};

export default Home;
