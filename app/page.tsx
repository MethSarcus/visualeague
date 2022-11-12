"use client"
import { Center, Container, Heading, Box, GridItem, Grid } from "@chakra-ui/react";
import { useRef, useState } from "react";
import { text } from "stream/consumers";
import LeagueCellGroup from "../components/forms/LeagueCellGroup";
import UsernameForm from "../components/forms/UsernameForm";
import styles from "../styles/Home.module.css";

export default function Page() {
  const [usernameSubmitted, setUsernameSubmitted] = useState(false)
  const [userName, setUsername] = useState(null)

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
              bg={"surface.0"}
              boxShadow={5}
              p={[4, 8, 10, 12]}
              overflow="hidden"
              borderRadius={10}
            >
              <Box  w={["xs", "md", "lg", "xl", "2xl"]}>
                <Heading
                  display="flex"
                  flexDirection="row"
                  justifyContent="center"
                  alignItems="center"
                  size={["lg", "xl", "2xl"]}
                  color="#FFFFFF"
                  pb={6}
                >
                  VisuaLeague
                </Heading>
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
