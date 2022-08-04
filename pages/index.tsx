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

  const onFormSubmit = (e: React.SyntheticEvent) => {
    e.preventDefault();

    router.push({
      pathname: "/user/" + text + "/overview",
    });
  };

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
          <header className="App-header">
            <h1>Draft Sniper</h1>
          </header>
          <Image
            className="bgImage"
            src={bg}
            objectFit={"cover"}
            layout={"fill"}
            z-index={0}
            alt="Picture of draftboard"
            placeholder="blur" // Optional blur-up while loading
          />
          <div className="formContainer">
            <UsernameForm callback={onFormSubmit}/>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Home;
