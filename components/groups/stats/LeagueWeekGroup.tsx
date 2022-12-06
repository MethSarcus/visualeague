import { HStack } from "@chakra-ui/react";
import League from "../../../classes/custom/League";
import Matchup from "../../../classes/custom/Matchup";
import LeagueNotableWeekStatCard from "../../cards/statcards/LeagueNotableWeekStatCard";
import WeekStatCard from "../../cards/statcards/WeekStatCard";

interface MyProps {
  league: League | undefined;
}
export default function LeagueNotableWeeksStatGroup(props: MyProps) {
  let bestWeekTeam;
  let bestWeek;
  let worstWeekTeam;
  let worstWeek;
  let closestGame: Matchup | undefined = undefined
  let furthestGame: Matchup | undefined = undefined
  let biggestShootout: Matchup | undefined = undefined //highest combined score
  let smallestShootout: Matchup | undefined = undefined

  if (props.league?.settings != undefined) {
    let notableWeeks = props.league.getLeagueNotableWeeks();
    
    bestWeek = notableWeeks.matchupForBestTeam as unknown as Matchup;
    bestWeekTeam = bestWeek.getWinner();
    worstWeek = notableWeeks.matchupForWorstTeam as unknown as Matchup;
    worstWeekTeam = worstWeek.getLoser();

    closestGame = notableWeeks.closestGame as unknown as Matchup;
    biggestShootout = notableWeeks.biggestShootout as unknown as Matchup;
    furthestGame = notableWeeks.furthestGame as unknown as Matchup;
    smallestShootout = notableWeeks.smallestShootout as unknown as Matchup;
  }

  return (
    <HStack>
      <WeekStatCard
        matchupSide={bestWeekTeam}
        memberId={bestWeekTeam?.roster_id}
        matchup={bestWeek}
        mainStat={`${bestWeekTeam?.pf?.toFixed(2)} PF`}
        title={"Highest Score"}
        subStat={
          props.league?.members?.get(bestWeekTeam?.roster_id ?? 0)?.teamName
        }
        isLoaded={bestWeekTeam != undefined}
      />
      <WeekStatCard
        matchupSide={worstWeekTeam}
        memberId={worstWeekTeam?.roster_id}
        matchup={worstWeek}
        mainStat={`${worstWeekTeam?.pf?.toFixed(2)} PF`}
        title={"Lowest Score"}
        subStat={
          props.league?.members?.get(worstWeekTeam?.roster_id ?? 0)?.teamName
        }
        isLoaded={bestWeekTeam != undefined}
      />
      <LeagueNotableWeekStatCard
        matchup={biggestShootout}
        title={"Biggest Shootout"}
        mainStat={`${biggestShootout?.getCombinedScore().toFixed(2)}`}
        subSubStat={"Combined Points"}
        isLoaded={biggestShootout != undefined}
      />
    </HStack>
  );
}
