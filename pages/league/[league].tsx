import {
  Box,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { useState } from "react";
import Footer from "../../components/Footer";
import LeaguePageContent from "../../components/LeaguePageContent";
import Navbar from "../../components/nav/Navbar";

const LeaguePage: NextPage = () => {
  const [text, setText] = useState("");
  


  return (
    <Box bg={"surface.0"} >
      <Grid
        templateAreas={`"header header"
                  "main main"
                  "footer footer"`}
        color="surface.0"
        fontWeight="bold"
      >
        <GridItem area={"header"}>
          <Navbar />
        </GridItem>

        <GridItem bg="surface.0" area={"main"} p={[0, 0, 4]} overflow={'scroll'}>
          <LeaguePageContent />
        </GridItem>

        <GridItem bg="surface.1" area={"footer"}>
          <Footer />
        </GridItem>
      </Grid>
    </Box>

  );
};

export default LeaguePage;
