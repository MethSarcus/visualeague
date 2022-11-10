import {
  Box,
  Flex,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { useState } from "react";
import Footer from "../../components/Footer";
import LeaguePageContent from "../../components/page_layouts/LeaguePageContent";
import Navbar from "../../components/nav/Navbar";
import Head from "next/head";
import styles from "../../styles/Home.module.css";

const LeaguePage: NextPage = () => {
  const [text, setText] = useState("");
  


  return (
    <div className={styles.container}>
    <Head>
      <title>Visualeague</title>
      <meta
        name="Visualize your league"
        content="Created by Seth Marcus"
      />
      <link rel="icon" href="/favicon.ico" />
    </Head>
    <main className={styles.main}>
      <div className="App">
      <Grid
      gap={0}
      h={"100vh"}
        gridTemplateRows={'.03fr 1fr'}
        templateAreas={`"header header"
                  "main main"
                  "footer footer"`}
        color="surface.0"
        fontWeight="bold"
      >
        <GridItem area={"header"}>
          <Navbar />
        </GridItem>

        <GridItem area={"main"} p={[0, 0, 4]} overflow={'scroll'}>
          <LeaguePageContent />
        </GridItem>

        <GridItem bg="surface.0" mt={"auto"} area={"footer"}>
          <Footer />
        </GridItem>
      </Grid>
      </div>
      </main>
      </div>
    

  );
};

export default LeaguePage;
