import { Box, Button, Code, Container, Flex, Heading } from "@chakra-ui/react";
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
import Sidebar from "./nav/Sidebar";
import BarChart from "./charts/PFBarChart";
import BumpChart from "./charts/BumpChart";
import AreaBumpChart from "./charts/WeeklyPFAreaBumpChart";
import PowerRankingBumpChart from "./charts/PowerRankingBumpChart";
import TeamRadarChart from "./charts/TeamRadarChart";
import LineChart from "./charts/LineChart";
import LineupPieChart from "./charts/LineupPieChart";

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
      <Container maxW={"container.xl"} maxH={"container.xl"}>
        {context.settings != undefined && (
          <Heading color={"white"}>{context.settings.name}</Heading>
        )}
        {context.settings != undefined && (
          <LeagueOverviewDataTable league={context}></LeagueOverviewDataTable>
        )}
        <Box width={"100%"} height={"50vh"}>
          {context.settings !== undefined && <BarChart league={context} />}
        </Box>
        <Box width={"100%"} height={"50vh"}>
          {context.settings !== undefined && <BumpChart league={context} />}
        </Box>
        <Box width={"100%"} height={"50vh"}>
          {context.settings !== undefined && <AreaBumpChart league={context} />}
        </Box>
        <Box width={"100%"} height={"50vh"}>
          {context.settings !== undefined && (
            <PowerRankingBumpChart league={context} />
          )}
        </Box>
        <Box width={"100%"} height={"50vh"}>
          {context.settings !== undefined && (
            <TeamRadarChart league={context} />
          )}
        </Box>
        <Box width={"100%"} height={"50vh"}>
          {context.settings !== undefined && (
            <LineChart league={context} />
          )}
        </Box>
        <Box width={"100%"} height={"50vh"}>
          {context.weeks !== undefined && (
            <LineupPieChart players={context.weeks.get(1).matchups.get(1).homeTeam.starters} playerDetails={context.playerDetails}/>
          )}
        </Box>
      </Container>
    </>
  );
};

export default LeaguePageContent;
