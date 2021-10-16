import Layout from "@/components/_Layout";
import dynamic from 'next/dynamic'
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import ListSubheader from '@mui/material/ListSubheader';
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

// Dynamic component needs to know about the crossword component's props.
interface CrosswordProps {
  data: any;
};
const DynamicCrossword = dynamic<CrosswordProps>(() => import("@guardian/react-crossword"), {
  ssr: false,
  loading: () => <p>Loading crossword...</p>
});

const apiUrl = "https://cryptic-solver-backend.herokuapp.com";

/** Gets and parses the data for a crossword at the given url. */
async function getCrossword(url: string): Promise<any> {
  //TODO: move this into an api client class or something.
  const response = await fetch(`${apiUrl}/fetch-crossword`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url })
  });

  return await response.json();
}

const Crossword: NextPage = () => {
  const router = useRouter();

  const [clientRender, setClientRender] = useState(false);
  const [crosswordData, setCrosswordData] = useState<any>();
  const [clueSelected, setClueSelected] = useState("");

  // Load crossword data.
  useEffect(() => {
    async function fetchCrossword() {
      const data = await getCrossword(router.query.url as string).catch(
        (error) =>
          console.log("There was an error trying to fetch the crossword", error)
      );
      setCrosswordData(data);
    }

    if (router.query.url) {
      fetchCrossword();
    }
  }, [router.query.url]);

  // Set client render.
  useEffect(() => {
    setClientRender(true);
  }, []);

  const handleFindSolutions = () => {
    console.log(`finding solutions for clue ${clueSelected}`);
  };

  const handleSelectClue = (e) => {
    setClueSelected(e.target.value);
  }

  // @ts-ignore trust me bro.
  return (
    <Layout>
      {clientRender && crosswordData && (
        <>
          <DynamicCrossword data={crosswordData} />
          <div>
            <Typography variant="body1" gutterBottom>
              Select a clue and ask our solver to find possible solutions!
            </Typography>
            <Stack spacing={2} direction="row">
              <FormControl sx={{ m: 1, minWidth: 120 }}>
                <InputLabel htmlFor="clue-select">Clue</InputLabel>
                <Select defaultValue="" id="clue-select" label="Clue" value={clueSelected} onChange={handleSelectClue}>
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <ListSubheader>Across</ListSubheader>
                  {crosswordData.entries
                    .filter((entry) => entry.direction === "across")
                    .map((data) => (
                      <MenuItem
                        value={`across-${data.number}`}
                      >{`Across ${data.number}`}</MenuItem>
                    ))}
                  <ListSubheader>Down</ListSubheader>
                  {crosswordData.entries
                    .filter((entry) => entry.direction === "down")
                    .map((data) => (
                      <MenuItem
                        value={`down-${data.number}`}
                      >{`Down ${data.number}`}</MenuItem>
                    ))}
                </Select>
              </FormControl>
              <Button variant="text" onClick={handleFindSolutions}>
                Find solutions!
              </Button>
            </Stack>
          </div>
        </>
      )}
    </Layout>
  );
};

export default Crossword;