import Layout from "@/components/_Layout";
import dynamic from 'next/dynamic'
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

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

  // Load crossword data.
  useEffect(() => {
    async function fetchCrossword() {
      const data =
        await getCrossword(router.query.url as string).catch((error) =>
          console.log("There was an error trying to fetch the crossword", error))
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

  // @ts-ignore trust me bro.
  return (
    <Layout>
      {clientRender && crosswordData && <DynamicCrossword data={crosswordData} />}
    </Layout>
  );
};

export default Crossword;