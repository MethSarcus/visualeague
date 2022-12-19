"use client";
import {
  Box, Container, Grid, GridItem
} from "@chakra-ui/react";
import Image from "next/image";
import UsernameForm from "../components/forms/UsernameForm";
import logo from "../public/images/logo.png";
import styles from "../styles/Home.module.css";
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
                  <Image alt="Visualeague" src={logo} priority={true} />
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
