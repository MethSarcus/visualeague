import { Box, Container, Heading, Center } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import UsernameForm from "../components/forms/UsernameForm";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const [text, setText] = useState("");
  const router = useRouter();

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
      <main className={`${styles.main} landing_screen`}>
        <div className="App">
          <Center h={"container.md"}>
          <Container
            className="formContainer"
            maxW={"2xl"}
            bg={"surface.0"}
            boxShadow={5}
            p={[4, 8, 10, 12]}
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
                pb={6}
              >
                Visualeague
              </Heading>
              <UsernameForm />
            </Box>
          </Container>
          </Center>
          
        </div>
      </main>
    </div>
  );
};

export default Home;
