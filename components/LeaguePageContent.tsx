import { Box, Button, Code, Heading } from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { Context } from "../contexts/Context";
import League from "../classes/custom/League";
import GenericStatCard from "./cards/statcards/GenericStatCard";
import LeagueOverviewDataTable from "./tables/LeagueOverviewDatatable";



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

  useEffect(() => {
    if (leagueData && leagueData.league) {
      console.log(leagueData)
      let league = new League(leagueData.league)
      console.log(league)
      setContext(league);
    }
  }, [leagueData, setContext]);

  const changeName = () => {
    context.settings.name = 'test'
    console.log(context)
  }
  


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
    <Box>
      {context.settings != undefined && (
        <Heading color={"white"}>{context.settings.name}</Heading>
      )}
      {context.settings != undefined && (
        <LeagueOverviewDataTable league={context}></LeagueOverviewDataTable>
      )}
      <Button onClick={changeName}>Button</Button>
      {/* {context.settings != undefined && <GenericStatCard statName={""} statValue={"3"} league={state}/>} */}
    </Box>
  );
};

export default LeaguePageContent;
