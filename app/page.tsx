"use client";
import {
  Text,
  Container,
  Heading,
  Box,
  GridItem,
  Grid,
  Avatar,
  HStack,
  VStack,
  Spacer,
  Flex,
} from "@chakra-ui/react";
import { useRef, useState } from "react";
import logo from "../public/images/logo.png";
import LeagueCellGroup from "../components/forms/LeagueCellGroup";
import UsernameForm from "../components/forms/UsernameForm";
import styles from "../styles/Home.module.css";
import Image from "next/image";
import MatchupPreview from "../components/cards/MatchupPreview";
export default function Page() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
        <div className="App">
          <Grid
            templateAreas={`"empty"
        "main"
        `} 
            templateRows="1fr"
            templateColumns="1fr"
          >
            <GridItem area={"empty"} h={"25vh"} />

            <GridItem area={"main"} w="100vw">
              <Container
                className="formContainer"
                maxW={"2xl"}
                maxH={"2xl"}
                bg={"surface"}
                outline={{ sm: "none", md: "solid" }}
                outlineColor={["surface", "surface.1"]}
                boxShadow={5}
                p={[4, 8, 10, 12]}
                overflow="none"
                borderRadius={10}
              >
                <Box w={["xs", "md", "lg", "xl", "2xl"]} color={"white"}>
                  <Image alt="Visualeague" src={logo} />
                  <UsernameForm />
                </Box>
              </Container>
            </GridItem>
          </Grid>
        </div>
      </main>
    </div>
  );
}
