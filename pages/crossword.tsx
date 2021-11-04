import Layout from "@/components/_Layout";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "next/link";
import { Puzzle } from "@/components/Crossword/model/Puzzle";
import { Box } from "@mui/system";
import { convertEveryman, getCrossword } from "@/components/Crossword/utils";
import NewCrossword from "@/components/Crossword/Crossword";
import Button from "@material-ui/core/Button";

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
          setPuzzle(convertEveryman(data));
          setFetchError(false);
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

  return (
    <>
      <Layout>
      <Button style={{marginLeft: "2rem", marginTop: "2rem"}} onClick={() => router.push("/")}>🠐 Back</Button>
        {puzzle && (
          <NewCrossword
            puzzle={puzzle}
            cellWidth={32}
            cellHeight={32}
          ></NewCrossword>
        )}
        {loadingCrossword && <CircularProgress />}
        {fetchError && !loadingCrossword && (
          <Box>
            <Typography variant="h4" data-cy="sorry">
              Sorry, your crossword could not be found!
            </Typography>
            <Link href="/">
              <a data-cy="try-again">Try Again</a>
            </Link>
          </Box>
        )}
      </Layout>
    </>
  );
};

export default Crossword;
