"use client";
import {
  Box,
  Button,
  Collapse,
  Container,
  Flex,
  Grid,
  GridItem,
  Heading,
  IconButton,
  Skeleton,
  SkeletonText,
  Spacer,
} from "@chakra-ui/react";
import axios from "axios";
import { MdExpandLess, MdExpandMore, MdMore } from "react-icons/md";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import League from "../../../classes/custom/League";
import GenericStatCard from "../../../components/cards/statcards/GenericStatCard";
import HomeStatGroup from "../../../components/groups/stats/HomeStatGroup";
import LeagueOverviewDataTable from "../../../components/tables/LeagueOverviewDatatable";
import { Context } from "../../../contexts/Context";
import BarChart from "../../../components/charts/PFBarChart";

export default function LeaguePage() {
  const [show, setShow] = useState(false);
  const handleToggle = () => setShow(!show);
  const [context, setContext] = useContext(Context);
  const leagueId = usePathname()?.replace("/league/", "");

  return (
    <Box overflowX={"hidden"}>
      <Skeleton
        height={"30px"}
        fontWeight="black"
        mx={10}
        my={2}
        isLoaded={context.settings != undefined}
      >
        <Heading textAlign={"center"} py={2} size={"md"} m={2} color={"white"}>
          {context?.settings?.name}
        </Heading>
      </Skeleton>

      <Grid
        gap={4}
        mx={4}
        my={2}
        templateAreas={`"pfStats pfStats pfStats"
                          "pfTable pfTable pfTable"
                          "pfChart pfChart pfChart"`}
        gridTemplateColumns={"1fr 1fr 1fr"}
      >
        <GridItem area={"pfStats"}>
          <HomeStatGroup league={context} />
        </GridItem>
        <GridItem overflowX={"hidden"} area={"pfTable"} borderRadius={4}>
          <Collapse startingHeight={"10%"} in={show}>
            <LeagueOverviewDataTable  league={context} />
          </Collapse>
          <Flex dropShadow={"2xl"} boxShadow="2xl" alignContent={"flex-end"} position={"relative"}>
            <Spacer/>
            <IconButton
              top="-1.7em"
              icon={show ? <MdExpandLess/> : <MdExpandMore />}
              borderRadius={"full"}
              colorScheme="secondary"
              size="sm"
              onClick={handleToggle}
              mt="1rem"
              aria-label={""}/>
          </Flex>
          {context.settings != undefined &&  <Box height={"500px"} textColor="black"><BarChart league={context} /></Box>}
        </GridItem>
        <GridItem area={"pfChart"} ></GridItem>
      </Grid>

      {/* {context.settings != undefined && <NumericalAvatarGroup statTitle="Points Scored" avatars={context.getPfOrdinalStats()} />}

      {context.settings != undefined && <GenericStatCard statName={"Best PF"} statValue={"111"} statOwner={"person"}/>} */}

      {/* {context.settings != undefined && (
        <Tabs
          overflowX={'hidden'}
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
      )} */}
    </Box>
  );
}
