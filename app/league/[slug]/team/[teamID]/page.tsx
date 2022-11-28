"use client";
import {
  Box,
  Grid,
  GridItem,
  HStack,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Tabs,
  Text,
} from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import League from "../../../../../classes/custom/League";
import GenericStatCard from "../../../../../components/cards/statcards/GenericStatCard";
import TeamCard from "../../../../../components/cards/TeamCard";
import TradeCard from "../../../../../components/cards/TradeCard";
import TeamPageRadarChart from "../../../../../components/charts/team_charts/TeamPageRadarChart";
import HomeStatGroup from "../../../../../components/groups/stats/HomeStatGroup";
import TeamPlayerStatGroup from "../../../../../components/groups/stats/TeamPlayerStatGroup";
import TeamStatGroup from "../../../../../components/groups/stats/TeamStatGroup";
import WeeklyTeamStatGroup from "../../../../../components/groups/stats/WeeklyTeamStatGroup";
import MemberTradeGroup from "../../../../../components/groups/transactions/MemberTradeGroup";
import { Context } from "../../../../../contexts/Context";

export default function TeamPage() {
  const [context, setContext] = useContext(Context);
  const memberId = usePathname()?.split("/").at(-1);

  return (
    <Box overflowX={"hidden"}>
      <Grid
        gap={5}
        mx={4}
        my={2}
        templateAreas={`"TeamSum TeamSum TeamSum"
                          "stats stats stats"
                          "playerStats playerStats playerStats"
                          "weekStats weekStats weekStats"
                          "radar radar radar"`}
      >
        <GridItem area={"TeamSum"} mt={3}>
          {context?.members != undefined && (
            <TeamCard
              member={context?.members.get(parseInt(memberId!))}
              league={context}
              variant={""}
              size={"md"}
            />
          )}
        </GridItem>
        <GridItem area={"stats"}>
          <TeamStatGroup league={context} memberId={parseInt(memberId!)} />
        </GridItem>

        <GridItem area={"playerStats"} overflowX={"clip"}>
          <Text mb={2} textColor={"textTheme.mediumEmphasis"}>
            Player Stats
          </Text>
          <Box overflowX={"scroll"}>
            <TeamPlayerStatGroup
              league={context}
              memberId={parseInt(memberId!)}
            />
          </Box>
        </GridItem>
        <GridItem area={"weekStats"} overflowX={"clip"}>
          <Text mb={2} textColor={"textTheme.mediumEmphasis"}>
            Team Stats
          </Text>
          <Box overflowX={"scroll"}>
            <WeeklyTeamStatGroup
              league={context}
              memberId={parseInt(memberId!)}
            />
          </Box>
        </GridItem>
        <GridItem maxH={"600px"} minH="300px" area={"radar"}>
          <Tabs variant='soft-rounded' colorScheme={"secondary"}>
            <TabList>
              <Tab>Pos Avg</Tab>
              <Tab>Two</Tab>
              <Tab>Trades</Tab>
            </TabList>

            <TabPanels>
              <TabPanel maxH={"600px"} minH="300px" h={"1px"}>
                <TeamPageRadarChart
                  league={context}
                  memberId={parseInt(memberId!)}
                />
              </TabPanel>
              <TabPanel>
                <p>two!</p>
              </TabPanel>
              <TabPanel>
            <MemberTradeGroup league={context} memberId={memberId}/>
              </TabPanel>
            </TabPanels>
          </Tabs>
        </GridItem>
      </Grid>
    </Box>
  );
}
