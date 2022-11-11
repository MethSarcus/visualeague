"use client"
import { Center, Container, Heading, Box } from "@chakra-ui/react";
import UsernameForm from "../components/forms/UsernameForm";
import styles from "../styles/Home.module.css";

export default function Page() {
  return (
    <div className={styles.container}>
      <main className={styles.main}>
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
                  VisuaLeague
                </Heading>
                <UsernameForm />
              </Box>
            </Container>
          </Center>
        </div>
      </main>
    </div>
  );
}
