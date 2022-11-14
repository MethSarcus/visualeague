"use client"
import { Center, Container, Heading, Box, GridItem, Grid } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { text } from "stream/consumers";
import logo from "../public/images/logo.png"
import LeagueCellGroup from "../components/forms/LeagueCellGroup";
import UsernameForm from "../components/forms/UsernameForm";
import styles from "../styles/Home.module.css";
import Image from 'next/image';
export default function Page() {

  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className="App">
        <Grid
        templateAreas={`"empty"
        "main"
        `}
  templateRows='1fr'
  templateColumns='1fr'
>

          <GridItem area={"empty"} h={"25vh"}/>
           
          <GridItem area={"main"} w="100vw">
            <Container
              className="formContainer"
              maxW={"2xl"}
              maxH={"2xl"}
              bg={"surface"}
              outline={["none","solid"]}
              outlineColor={["surface","surface.1"]}
              boxShadow={5}
              p={[4, 8, 10, 12]}
              overflow="scroll"
              borderRadius={10}
            >
              <Box  w={["xs", "md", "lg", "xl", "2xl"]}>
              <Image alt="Visualeague" src={logo} />
                <UsernameForm />

                {/* { usernameSubmitted && <LeagueCellGroup

                    usernameSubmitted={usernameSubmitted}
                    username={use}
                />} */}
              </Box>
            </Container>
            </GridItem>
          </Grid>
        </div>
      </main>
    </div>
  );
}
