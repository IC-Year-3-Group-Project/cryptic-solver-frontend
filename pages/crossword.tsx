import Layout from "@/components/_Layout";
import dynamic from "next/dynamic";
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import ListSubheader from "@mui/material/ListSubheader";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Link from "next/link";
import { Box } from "@mui/system";
import AnswerEntry from "@/components/AnswerEntry";
import Grid from "@mui/material/Grid";

// Dynamic component needs to know about the crossword component's props.
interface CrosswordProps {
  data: any;
  loadGrid: any;
}

const DynamicCrossword = dynamic<CrosswordProps>(
  () => import("@guardian/react-crossword"),
  {
    ssr: false,
    loading: () => <p>Loading crossword...</p>,
  }
);

const apiUrl = "https://cryptic-solver-backend.herokuapp.com";

/** Gets and parses the data for a crossword at the given url. */
async function getCrossword(url: string): Promise<any> {
  const response = await fetch(`${apiUrl}/fetch-crossword`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ url }),
  });

  return await response.json();
}

/** Gets possible solutions returns from the solver given a clue. */
async function getSolutions(
  clue: string,
  wordLengths: Array<number>
): Promise<any> {
  const response = await fetch(`${apiUrl}/solve-clue`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      clue: clue,
      word_length: wordLengths[0],
    }),
  });

  return await response.json();
}

const Crossword: NextPage = () => {
  const router = useRouter();

  const [clientRender, setClientRender] = useState(false);
  const [loadingCrossword, setLoadingCrossword] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [fetchSolutionError, setFetchSolutionError] = useState(false);
  const [crosswordData, setCrosswordData] = useState<any>();
  const [clueSelected, setClueSelected] = useState<string>("");
  const [loadingSolutions, setLoadingSolutions] = useState(false);
  const [solutionData, setSolutionData] = useState<Array<string>>([]);

  // Load crossword data.
  useEffect(() => {
    async function fetchCrossword() {
      setLoadingCrossword(true);
      await getCrossword(router.query.url as string)
        .catch((error) => {
          console.log(
            "There was an error trying to fetch the crossword",
            error
          );
          setFetchError(true);
        })
        .then((data) => {
          setCrosswordData(data);
          setClueSelected(data?.entries?.[0].clue);
        })
        .finally(() => {
          setLoadingCrossword(false);
        });
    }

    if (router.query.url) {
      fetchCrossword();
    } else if (clientRender) {
      setFetchError(true);
    }
  }, [router.query.url]);

  // Set client render.
  useEffect(() => {
    setClientRender(true);
  }, []);

  const handleSelectClue = (e: any) => {
    setClueSelected(e.target.value);
  };

  const handleFindSolutions = async () => {
    setLoadingSolutions(true);
    setFetchSolutionError(false);

    let clue = clueSelected.replace(/<[^>]*>?/gm, "");
    const wordLengths = clue
      .match(/\(.+\)$/)?.[0]
      .slice(1, -1)
      .split(",")
      .map((x: any) => parseInt(x)) || [0];
    clue = clue.replace(/\(.+\)$/, "").slice(0, -1);

    console.log(clue, wordLengths);

    // get possible solutions
    await getSolutions(clue, wordLengths)
      .catch((error) => {
        console.log("There was an error trying to fetch solutions", error);
        setFetchSolutionError(true);
      })
      .then((res) => {
        setSolutionData(res);
      })
      .finally(() => {
        setLoadingSolutions(false);
      });
  };

  // @ts-ignore trust me bro.
  return (
    <Layout>
      {clientRender && crosswordData && !fetchError && !loadingCrossword && (
        <>
          <DynamicCrossword data={crosswordData} loadGrid={() => {}} />
          <div>
            <Typography variant="body1" gutterBottom>
              Select a clue and ask our solver to find possible solutions!
            </Typography>
            <Stack spacing={2} direction="row">
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel htmlFor="clue-select">Clue</InputLabel>
                <Select
                  defaultValue={crosswordData?.entries?.[0].clue}
                  id="clue-select"
                  label="Clue"
                  onChange={handleSelectClue}
                  data-cy="select-clue"
                >
                  <ListSubheader>Across</ListSubheader>
                  {crosswordData.entries
                    .filter((entry: any) => entry.direction === "across")
                    .map((data: any) => (
                      <MenuItem
                        key={`across-${data.number}`}
                        value={data.clue}
                      >{`Across ${data.number}`}</MenuItem>
                    ))}
                  <ListSubheader>Down</ListSubheader>
                  {crosswordData.entries
                    .filter((entry: any) => entry.direction === "down")
                    .map((data: any) => (
                      <MenuItem
                        key={`down-${data.number}`}
                        value={data.clue}
                      >{`Down ${data.number}`}</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <Button
                variant="text"
                data-cy="find-solutions"
                onClick={handleFindSolutions}
              >
                Find solutions!
              </Button>
              {fetchSolutionError && (
                <div data-cy="error-solutions">
                  Error occurred trying to fetch solutions
                </div>
              )}
              {loadingSolutions && <div>Loading</div>}
              {!loadingSolutions &&
                !fetchSolutionError &&
                solutionData?.length > 0 &&
                solutionData[0].length > 0 && (
                  <div data-cy="found-solutions">
                    Found solutions:
                    {solutionData.map((solution, index) => (
                      <div key={index}>{solution}</div>
                    ))}
                  </div>
                )}
              {!loadingSolutions &&
                !fetchSolutionError &&
                solutionData?.length > 0 &&
                solutionData[0].length === 0 && (
                  <div data-cy="no-solutions">No solutions found</div>
                )}
            </Stack>
            <Box mt={5}>
              <AnswerEntry />
            </Box>
          </div>
        </>
      )}
      {loadingCrossword && <CircularProgress />}
      {fetchError && !loadingCrossword && (
        <Box>
          <Typography variant="h4" data-cy="sorry">
            Sorry your crossword could not be found
          </Typography>
          <Link href="/">
            <a data-cy="try-again">Try Again</a>
          </Link>
        </Box>
      )}
    </Layout>
  );
};

export default Crossword;
