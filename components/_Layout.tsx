import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";
import ArrowBackIosIcon from "@mui/icons-material/ArrowBackIos";
import Button from "@mui/material/Button";
import { useRouter } from "next/router";
import { Box } from "@mui/system";

interface Props {
  home?: boolean;
  title?: string;
  children?: any;
}

export default function Layout({
  home = false,
  title = "Cryptic Solver",
  children,
}: Props) {
  const router = useRouter();

  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/crossword.ico" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
      </Head>

      {!home && (
        <header>
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
        </header>
      )}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
