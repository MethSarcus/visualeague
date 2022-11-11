"use client";
import {
    Container,
    Grid,
    GridItem, Heading, Tab, TabList, TabPanel, TabPanels, Tabs, Box
} from "@chakra-ui/react";
import axios from "axios";
import type { NextPage } from "next";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import League from "../../../classes/custom/League";
import LineChart from "../../../components/charts/LineChart";
import LineupPieChart from "../../../components/charts/LineupPieChart";
import MemberSkillScatterPlot from "../../../components/charts/MemberSkillScatterPlot";
import BarChart from "../../../components/charts/PFBarChart";
import PFRadialBarChart from "../../../components/charts/PFRadialBar";
import TeamRadarChart from "../../../components/charts/TeamRadarChart";
import { Context } from "../../../contexts/Context";

const LeaguePage: NextPage = () => {
  const [text, setText] = useState("");
  const [context, setContext] = useContext(Context);
  const leagueId = usePathname()?.replace("/league/", "");
  const fetcher = (url: string) => axios.get(url).then((res) => res.data);

  const { data: leagueData, error: leagueError } = useSWR(
    leagueId != undefined ? `/api/league/${leagueId}` : null,
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
    <Box overflowX={"hidden"}>
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

          <TabPanels textColor="black">
            <TabPanel px={[0, "auto"]} mx={[0.5, "auto"]}>
              <Container maxW={"container.xl"} p={[0, "auto"]} m={[0, "auto"]}>
                <Grid templateRows="12" templateColumns="12" gap={4}>
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
                <Grid templateRows="12" templateColumns="12" gap={4}>
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
          </TabPanels>
        </Tabs>
      )}
    </Box>
  );
};

export default LeaguePage;
