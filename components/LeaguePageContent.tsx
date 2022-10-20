import { Box, Button, Code, Container, Heading } from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { Context } from "../contexts/Context";
import CustomSleeperLeague from "../classes/custom/League";
import GenericStatCard from "./cards/statcards/GenericStatCard";
import LeagueOverviewDataTable from "./tables/LeagueOverviewDatatable";
import produce from "immer";
import {enableAllPlugins} from "immer"
import LeagueSettingsModal from "./forms/LeagueSettingsModal";

enableAllPlugins()
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
      draftState.settings.name = "test"
    });
    setContext(nextState);
  };

  useEffect(() => {
    if (leagueData && leagueData.league) {
      console.log(leagueData);
      let league = new CustomSleeperLeague(leagueData.league);
      console.log(league);
      setContext(league);
      setState(league);
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
    <Container>
      {context.settings != undefined && (
        <Heading color={"white"}>{context.settings.name}</Heading>
      )}
      {context.settings != undefined && (
        <LeagueOverviewDataTable league={context}></LeagueOverviewDataTable>
      )}
      {context.settings && <LeagueSettingsModal/>}
    </Container>
  );
};

export default LeaguePageContent;
