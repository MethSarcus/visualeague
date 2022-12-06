import { Card, HStack, Spinner } from "@chakra-ui/react";
import League from "../../../classes/custom/League";
import Matchup from "../../../classes/custom/Matchup";
import { MatchupSide } from "../../../classes/custom/MatchupSide";
import LeagueNotableWeekStatCard from "../../cards/statcards/LeagueNotableWeekStatCard";
import WeekStatCard from "../../cards/statcards/WeekStatCard";

interface MyProps {
  league: League | undefined;
}
export default function LeagueNotableWeeksStatGroup(props: MyProps) {
  let bestWeekTeam
  let worstWeek

  if (props.league?.settings != undefined) {
    let notableWeeks = props.league.getLeagueNotableWeeks();
    bestWeekTeam = (notableWeeks.matchupForBestTeam as unknown as Matchup).getWinner()

  }

  return (
    <HStack>
      <WeekStatCard
        matchupSide={
          bestWeekTeam}
        memberId={
          bestWeekTeam?.roster_id
        }
        mainStat={bestWeekTeam?.pf?.toFixed(2)}
        title={"Best Weekly Score"}
        isLoaded={bestWeekTeam != undefined}
      />
      {/* <LeagueNotableWeekStatCard
        matchup={notableWeeks?.matchupForBestTeam}
        title={undefined}
        mainStat={undefined}
        isLoaded={false}
      /> */}
    </HStack>
  );
}
