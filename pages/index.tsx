import { Box, Container, Heading } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import GenericStatCard, { OrdinalStatCard } from "../components/cards/statcards/GenericStatCard";
import UsernameForm from "../components/forms/UsernameForm";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [text, setText] = useState("");
  const router = useRouter();

  return (
    <div className={styles.container}>
      <Head>
        <title>Dynasty Dash</title>
        <meta
          name="A Dashboard for Dynasty Leagues"
          content="Created by Seth Marcus"
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={styles.main}>
        <div className="App">
          <Container
            className="formContainer"
            maxW={"2xl"}
            bg={"surface.1"}
            boxShadow={5}
            p={12}
            overflow="hidden"
            borderRadius={10}
          >
            <Box maxH={"2xl"} w={['xs','md','lg', 'xl', '2xl']}>
              <Heading
                display="flex"
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                size={['lg', 'xl', '2xl']}
                color="#FFFFFF"
                pb={10}
              >
                Dynasty Dash
              </Heading>
              <UsernameForm />
            </Box>
          </Container>
        </div>
      </main>
    </div>
  );
};

export default Home;
