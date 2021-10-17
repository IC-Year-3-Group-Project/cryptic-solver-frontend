import type { NextPage } from "next";
import React, { useState } from "react";
import Layout from "@/components/_Layout";
import styles from "@/styles/Home.module.css";
import TextField from "@mui/material/TextField";
import { useRouter } from "next/router";

const Home: NextPage = () => {
  const KEYCODE_ENTER = 13;

  const router = useRouter();
  const [crosswordLink, setCrosswordLink] = useState("");

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
      </>
    </Layout>
  );
};

export default Home;
