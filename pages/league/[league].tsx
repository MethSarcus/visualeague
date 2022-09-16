import {
  Box, Center, Grid,
  GridItem,
  Heading,
  SimpleGrid,
  Wrap,
  WrapItem
} from "@chakra-ui/react";
import type { NextPage } from "next";
import { useRouter } from "next/router";
import { useState } from "react";
import GenericStatCard from "../../components/cards/statcards/GenericStatCard";
import Footer from "../../components/Footer";
import Navbar from "../../components/nav/Navbar";
import LeagueOverviewDataTable from "../../components/tables/LeagueOverviewDatatable";
import FantasyLeagueMember from "../../interfaces/sleeper_api/custom/FantasyLeagueMember";


const tempTestMembers = [new FantasyLeagueMember("23452352", "smeth", 1),new FantasyLeagueMember("23452352", "meth", 2),new FantasyLeagueMember("23452352", "clyde", 3)]

const LeaguePage: NextPage = () => {
  const [text, setText] = useState("");
  const router = useRouter();

  return (
    <Box w={"100%"} h="100%" bg={"surface.0"}>
      <Grid
        templateAreas={`"header header"
                  "main main"
                  "footer footer"`}
        gridTemplateRows={"50px 1fr 30px"}
        gridTemplateColumns={"150px 1fr"}
        h="100%"
        gap="1"
        color="surface.0"
        fontWeight="bold"
      >
        <GridItem area={"header"}>
          <Navbar />
        </GridItem>

        
        <GridItem width={'100%'} bg="surface.0" area={"main"} p={4}>
          <Center color="white"><Heading>League</Heading></Center>
            <Wrap spacing={6} mt={2}>
              <WrapItem>
                <GenericStatCard statName={"Stat"} statValue={"00.00"}/>
              </WrapItem>
              <WrapItem>
                <GenericStatCard statName={"Stat"} statValue={"00.00"}/>
              </WrapItem>
              <WrapItem>
                <GenericStatCard statName={"Stat"} statValue={"00.00"}/>
              </WrapItem>
              <WrapItem>
                <GenericStatCard statName={"Stat"} statValue={"00.00"}/>
              </WrapItem>
              <WrapItem>
                <GenericStatCard statName={"Stat"} statValue={"00.00"}/>
              </WrapItem>
            </Wrap>
          
        </GridItem>

        <GridItem  bg="surface.1" area={"footer"}>
          <Footer/>
       
        </GridItem>
      </Grid>
    </Box>
  );
};

export default LeaguePage;
