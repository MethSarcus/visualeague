import { Box, Heading } from "@chakra-ui/react";
import axios from "axios";
import { useRouter } from "next/router";
import useSWR from "swr";
import League from "../interfaces/sleeper_api/custom/League";

const LeaguePageContent = () => {
  const router = useRouter();
  const leagueId = router.query.league;

  const fetcher = (url: string) => axios.get(url).then((res) => res.data);
  const { data: leagueData, error: leagueError } = useSWR(
    leagueId != undefined ? `/api/league/${router.query.league}` : null,
    fetcher
  );
  if (leagueError) return <Heading color={"white"} h={"100%"}>Failed to load</Heading>;
  if (!leagueData) return <Heading color={"white"} h={"100%"} >Loading...</Heading>;
  const league = new League(leagueData.league);

  return (
    <Heading color={"white"}>
      {league.settings.name}
    </Heading>
  );
};

export default LeaguePageContent;
