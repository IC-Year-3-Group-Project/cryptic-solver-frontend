import type { NextPage } from "next";
import React, { useState } from "react";
import Layout from "@/components/_Layout";
import styles from "@/styles/Home.module.css";
import TextField from "@mui/material/TextField";
import axios from "axios";
import { decode } from "html-entities";

const http = axios.create();

/** Gets and parses the data for a crossword at the given url. */
async function getEveryman(url: string): Promise<any> {
  // TODO: fix inevitable cors error (proxy this request through backend, 
  // makes sense when fetching from other sources anyway).
  const response = await http.get<string>(url);
  const match = /data\-crossword\-data="(.*)"/g.exec(response.data);
  if (match && match.length > 1) {
    return JSON.parse(decode(match[1]));
  }
  return undefined;
}

const Home: NextPage = () => {
  const KEYCODE_ENTER = 13;

  const [crosswordLink, setCrosswordLink] = useState("");

  const handleCrosswordLinkInput = (e: any) => {
    setCrosswordLink(e.target.value);
  };

  const handleCrosswordLinkEntry = async (e: any) => {
    if (e.keyCode == KEYCODE_ENTER) {
      // parse website and go to crossword page
      console.log(`Parsing ${crosswordLink}`);
      const crossword = await getEveryman(crosswordLink);
      // TODO: show grid with this crossword data.
      setCrosswordLink("");
    }
  };

  return (
    <Layout>
      <>
        <h1 className={styles.title}>Cryptic Crossword Solver</h1>

        <p className={styles.description}>
          Enter a link to an Everyman Guardian crossword:
        </p>

        <TextField
          label="Everyman link"
          fullWidth
          variant="standard"
          value={crosswordLink}
          onChange={handleCrosswordLinkInput}
          onKeyDown={handleCrosswordLinkEntry}
        />
      </>
    </Layout>
  );
};

export default Home;
