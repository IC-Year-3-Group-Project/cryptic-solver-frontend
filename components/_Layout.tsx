import Head from "next/head";
import Image from "next/image";
import styles from "@/styles/Home.module.css";

interface Props {
  title?: string;
  children?: any;
}

export default function Layout({ title = "Cryptic Solver", children }: Props) {
  return (
    <div className={styles.container}>
      <Head>
        <title>{title}</title>
        <meta name="viewport" content="initial-scale=1.0, width=device-width" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css?family=Roboto:300,400,500,700&display=swap"
        />
      </Head>

      <main className={styles.main}>{children}</main>

    </div>
  );
}
