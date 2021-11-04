import React, { useEffect } from "react";
import Typography from "@mui/material/Typography";
import Link from "next/link";
import { useRouter } from "next/router";
import Layout from "@/components/_Layout";

export default function NotFound() {
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => {
      router.push("/");
    }, 5000);
  });

  return (
    <Layout title="page not found">
      <Typography variant="h1">Oops...</Typography>
      <Typography variant="h2">That page cannot be found</Typography>
      <Typography>
        Go back to the <Link href="/">HomePage</Link>
      </Typography>
    </Layout>
  );
}
