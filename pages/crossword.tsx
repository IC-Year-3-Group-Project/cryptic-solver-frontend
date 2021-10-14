import Layout from "@/components/_Layout";
import dynamic from 'next/dynamic'
import { NextPage } from "next";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";

const DynamicCrossword = dynamic(() => import("@guardian/react-crossword"), { ssr: false });
const apiUrl = "http://localhost:8000";

/** Gets and parses the data for a crossword at the given url. */
async function getCrossword(url: string): Promise<any> {
    //TODO: 
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
      const data = await getCrossword(router.query.url as string);
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

  return (
    <Layout>
      {clientRender && crosswordData && <DynamicCrossword data={crosswordData}/>}
    </Layout>
  );
};

export default Crossword;