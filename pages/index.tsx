import { Box, Container, Heading } from "@chakra-ui/react";
import type { NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import UsernameForm from "../components/forms/UsernameForm";
import styles from "../styles/Home.module.css";
import CustomHead from "../utility/CustomHead";

const Home: NextPage = () => {
  const [text, setText] = useState("");
  const router = useRouter();

  return (
    <div className={styles.container}>
      <CustomHead/>
      <main className={styles.main}>
        <div className="App">
          <Container
            className="formContainer"
            maxW={"2xl"}
            bg={"surface.0"}
            boxShadow={5}
            p={[4, 8, 10, 12]}
            overflow="hidden"
            borderRadius={10}
          >
            <Box maxH={"2xl"} w={["xs", "md", "lg", "xl", "2xl"]}>
              <Heading
                display="flex"
                flexDirection="row"
                justifyContent="center"
                alignItems="center"
                size={["lg", "xl", "2xl"]}
                color="#FFFFFF"
                pb={6}
              >
                Visualeague
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
