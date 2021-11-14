import Layout from "@/components/_Layout";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "next/link";
import { Puzzle } from "@/components/Crossword/model/Puzzle";
import Box from "@mui/system/Box";
import {
  classify,
  convertEveryman,
  getCrossword,
} from "@/components/Crossword/utils";
import NewCrossword from "@/components/Crossword/Crossword";
import Button from "@mui/material/Button";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";

const Crossword: NextPage = () => {
  const router = useRouter();

  const [loadingCrossword, setLoadingCrossword] = useState(true);
  const [fetchError, setFetchError] = useState(false);

  const [puzzle, setPuzzle] = useState<Puzzle>();

  // Load crossword data.
  useEffect(() => {
    async function fetchCrossword() {
      setFetchError(false);
      setLoadingCrossword(true);

      await getCrossword(router.query.url as string)
        .then((data) => {
          const puzzle = convertEveryman(data);
          if (puzzle.rows && puzzle.clues && puzzle.columns) {
            setPuzzle(puzzle);
            setFetchError(false);
          } else {
            setFetchError(true);
          }
        })
        .catch((error) => {
          console.log(
            "There was an error trying to fetch the crossword",
            error
          );
          setFetchError(true);
        })
        .finally(() => {
          setLoadingCrossword(false);
        });
    }

    if (router.query.url) {
      fetchCrossword();
    } else {
      console.log("No url found");
      setFetchError(true);
      setLoadingCrossword(false);
    }
  }, [router.query.url]);

  useEffect(() => {
    if (router.query.raw) {
      try {
        const puzzle = classify(JSON.parse(router.query.raw as string));
        if (puzzle.rows && puzzle.clues && puzzle.columns) {
          setPuzzle(puzzle);
          setFetchError(false);
        } else {
          setFetchError(true);
        }
      } catch (ex) {
        console.log("Error loading raw crossword.", ex);
        setFetchError(true);
      }
      setLoadingCrossword(false);
    }
  }, [router.query.raw]);

  return (
    <>
      {puzzle && (
        <>
          <Box mb={2} style={{ display: "flex", justifyContent: "center" }}>
            <Button
              style={{
                marginTop: "2rem",
                maxWidth: "100px",
              }}
              onClick={() => router.back()}
              startIcon={<ArrowBackIosIcon />}
              variant="outlined"
            >
              Back
            </Button>
          </Box>
          <NewCrossword puzzle={puzzle} cellWidth={32} cellHeight={32} />
        </>
      )}
      {loadingCrossword && (
        <Layout>
          <CircularProgress />
        </Layout>
      )}
      {fetchError && !loadingCrossword && (
        <Layout>
          <Box>
            <Typography variant="h4" data-cy="sorry">
              Sorry, your crossword could not be found!
            </Typography>
            <Link href="/">
              <a data-cy="try-again">Try Again</a>
            </Link>
          </Box>
        </Layout>
      )}
    </>
  );
};

export default Crossword;
