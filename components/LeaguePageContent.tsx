import {
  Box,
  Button,
  Code,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  SimpleGrid,
  Spacer,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  VStack,
} from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { Context } from "../contexts/Context";
import CustomSleeperLeague from "../classes/custom/League";
import GenericStatCard from "./cards/statcards/GenericStatCard";
import LeagueOverviewDataTable from "./tables/LeagueOverviewDatatable";
import produce from "immer";
import { enableAllPlugins } from "immer";
import SettingsSidebar from "./nav/SettingsSidebar";
import BarChart from "./charts/PFBarChart";
import BumpChart from "./charts/BumpChart";
import AreaBumpChart from "./charts/WeeklyPFAreaBumpChart";
import PowerRankingBumpChart from "./charts/PowerRankingBumpChart";
import TeamRadarChart from "./charts/TeamRadarChart";
import LineChart from "./charts/LineChart";
import LineupPieChart from "./charts/LineupPieChart";
import RadialBarChart from "./charts/PFRadialBar";
import PFRadialBarChart from "./charts/PFRadialBar";
import MemberSkillScatterPlot from "./charts/MemberSkillScatterPlot";
import BaseStatsLayout from "./groups/BaseStatsLayout";

enableAllPlugins();
const LeaguePageContent = () => {
  const router = useRouter();
  const [context, setContext] = useContext(Context);
  const [state, setState] = useState({});
  const leagueId = router.query.league;
  const fetcher = (url: string) => axios.get(url).then((res) => res.data);

  const { data: leagueData, error: leagueError } = useSWR(
    leagueId != undefined ? `/api/league/${router.query.league}` : null,
    fetcher
  );

  const changeLeagueInfo = () => {
    const nextState = produce(context, (draftState: CustomSleeperLeague) => {
      draftState.settings.name = "test";
    });
    setContext(nextState);
  };

  useEffect(() => {
    if (leagueData && leagueData.league) {
      console.log(leagueData);
      let league = new CustomSleeperLeague(leagueData.league);
      console.log(league);
      setContext(league);
    }
  }, [leagueData, setContext]);

  if (leagueError)
    return (
      <Heading color={"white"} h={"100%"}>
        Failed to load
      </Heading>
    );
  if (!leagueData)
    return (
      <Heading color={"white"} h={"100%"}>
        Loading...
      </Heading>
    );

  return (
    <>
      {context.settings != undefined && (
        <Heading color={"white"}>{context.settings.name}</Heading>
      )}
      {context.settings != undefined && (
        <Tabs variant="soft-rounded" textColor={"white"}>
          <TabList>
            <Tab>Basic Stats</Tab>
            <Tab>Advanced Stats</Tab>
            <Tab>Whacky Charts</Tab>
          </TabList>

          <TabPanels textColor="black">
            <TabPanel px={[0,  "auto"]} mx={[0,  "auto"]}>
              <Container maxW={"container.xl"} p={[0,  "auto"]} m={[0,  "auto"]}>
                <Grid
                  templateRows="repeat(12, 1fr)"
                  templateColumns="repeat(12, 1fr)"
                  gap={4}
                >
                  <GridItem height={"500px"} colSpan={12} textColor="black">
                    <BarChart league={context} />
                  </GridItem>
                  <GridItem height={"350px"} colSpan={[12, 6]} textColor="black">
                    <LineChart league={context} />
                  </GridItem>
                  <GridItem height={"350px"} colSpan={[12, 6]} textColor="black">
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
              <Container maxW={"container.xl"}>
                <Grid
                  width={"100%"}
                  templateRows="repeat(12, 1fr)"
                  templateColumns="repeat(12, 1fr)"
                  gap={4}
                >
                  <GridItem colSpan={[12, 12]} height={"500px"}>
                    <BumpChart league={context} />
                  </GridItem>
                  <GridItem colSpan={[12, 12, 12]} height={"500px"}>
                    <AreaBumpChart league={context} />
                  </GridItem>
                  <GridItem colSpan={[12, 12, 12]} height={"500px"}>
                    <PowerRankingBumpChart league={context} />
                  </GridItem>
                </Grid>
              </Container>
            </TabPanel>
          </TabPanels>
        </Tabs>
      )}
    </>
  );
};

export default LeaguePageContent;
