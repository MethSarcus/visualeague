import {
  Container,
  Grid,
  GridItem,
  Heading,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
} from "@chakra-ui/react";
import axios from "axios";
import produce, { enableAllPlugins } from "immer";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import League from "../../classes/custom/League";
import { Context } from "../../contexts/Context";
import LineChart from "../charts/LineChart";
import LineupPieChart from "../charts/LineupPieChart";
import MemberSkillScatterPlot from "../charts/MemberSkillScatterPlot";
import BarChart from "../charts/PFBarChart";
import PFRadialBarChart from "../charts/PFRadialBar";
import TeamRadarChart from "../charts/TeamRadarChart";
import TradePageContent from "./TradePageContent";

enableAllPlugins();
const LeaguePageContent = () => {
  const router = useRouter();
  const [context, setContext] = useContext(Context);
  const leagueId = router.query.league;
  const fetcher = (url: string) => axios.get(url).then((res) => res.data);

  const { data: leagueData, error: leagueError } = useSWR(
    leagueId != undefined ? `/api/league/${router.query.league}` : null,
    fetcher
  );

  useEffect(() => {
    if (leagueData && leagueData.league) {
      let league = new League(leagueData.league);
      console.log(league);
      setContext(league);
    }
  }, [leagueData, setContext]);

  if (leagueError) return <Heading color={"white"}>Failed to load</Heading>;
  if (!leagueData) return <Heading color={"white"}>Loading...</Heading>;

  return (
    <>
      {context.settings != undefined && (
        <Heading
          width={"100%"}
          textAlign={"center"}
          my={3}
          size={"sm"}
          color={"white"}
        >
          {context.settings.name}
        </Heading>
      )}
      {context.settings != undefined && (
        <Tabs
          isLazy
          isFitted
          variant={"line"}
          textColor={"white"}
          maxWidth={"100vw"}
        >
          <TabList>
            <Tab>Basic Stats</Tab>
            <Tab>Advanced Stats</Tab>
            <Tab>Trades</Tab>
          </TabList>

          <TabPanels textColor="black" maxWidth={"100vw"} background="surface.2">
            <TabPanel px={[0, "auto"]} mx={[0, "auto"]}>
              <Container maxW={"container.xl"} p={[0, "auto"]} m={[0, "auto"]}>
                <Grid
                  templateRows="repeat(12, 1fr)"
                  templateColumns="repeat(12, 1fr)"
                  gap={4}
                >
                  <GridItem height={"500px"} colSpan={12} textColor="black">
                    <BarChart league={context} />
                  </GridItem>
                  <GridItem
                    height={"350px"}
                    colSpan={[12, 6]}
                    textColor="black"
                  >
                    <LineChart league={context} />
                  </GridItem>
                  <GridItem
                    height={"350px"}
                    colSpan={[12, 6]}
                    textColor="black"
                  >
                    <TeamRadarChart league={context} />
                  </GridItem>
                </Grid>
              </Container>
            </TabPanel>

            <TabPanel>
              <Container maxW={"container.xl"}>
                <Grid
                  templateRows="repeat(12, 1fr)"
                  templateColumns="repeat(12, 1fr)"
                  gap={4}
                >
                  <GridItem colSpan={8} height={"500px"}>
                    <MemberSkillScatterPlot league={context} />
                  </GridItem>
                  <GridItem colSpan={6} height={"500px"}>
                    <PFRadialBarChart league={context} />
                  </GridItem>
                  <GridItem colSpan={3} height={"500px"}>
                    <LineupPieChart
                      players={
                        context.weeks.get(1).matchups.get(1).homeTeam.starters
                      }
                      playerDetails={context.playerDetails}
                    />
                  </GridItem>
                </Grid>
              </Container>
            </TabPanel>

            <TabPanel>
              <TradePageContent />
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </>
  );
};

export default LeaguePageContent;
