import type { NextPage } from "next";
import Head from "next/head";
import styles from "../styles/Home.module.css";
import { useRouter } from "next/router";
import React, { useState, useRef } from "react";
import { Box, Container, Heading, Input, Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import Image from "next/image";
import bg from "../images/glitchedbg.png";
import Card from "../components/Card";
import UsernameForm from "../components/forms/UsernameForm";

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
          <Image
            className="bgImage"
            src={bg}
            objectFit={"cover"}
            layout={"fill"}
            z-index={0}
            alt="Picture of draftboard"
            placeholder="blur" // Optional blur-up while loading
          />
      <main className={styles.main}>
        <div className="App">

          <Container className="formContainer" maxW={'2xl'} bg={"surface.0"} boxShadow={5}
              p={20}
              overflow="hidden"
              borderRadius={10}>
            <Box w={'2xl'} maxH={'2xl'}>
              <Heading
                display="flex"
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                size="2xl"
                color="#FFFFFF"
                pb={30}
              >
                Dynasty Dash
              </Heading>
              <UsernameForm />
              <button
                type="button"
                onClick={(e) => {
                e.preventDefault();
                window.location.href='https://sleeper.com/settings/profile';
              }}
> Click here</button>
            </Box>
          </Container>
        </div>
      </main>
    </div>
  );
};

export default Home;
