"use client";
import { Grid, GridItem } from "@chakra-ui/react";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/nav/Navbar";
import styles from "../../../styles/Home.module.css";
export default function LeagueLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  return (
    <section>
      <main className={styles.main}>
        <div className="App">
          <Grid
            gap={0}
            h={"100vh"}
            gridTemplateRows={"0fr 1fr 0fr"}
            templateAreas={`"header header"
                    "main main"
                    "footer footer"`}
            color="surface.0"
            fontWeight="bold"
          >
            <GridItem area={"header"} >
              <Navbar />
            </GridItem>

            <GridItem area={"main"} p={[0, 0, 4]} overflow={"scroll"}>
              {children}
            </GridItem>

            <GridItem bg="surface.0" mt={"auto"} area={"footer"}>
              <Footer />
            </GridItem>
          </Grid>

        </div>
      </main>
    </section>
  );
}
