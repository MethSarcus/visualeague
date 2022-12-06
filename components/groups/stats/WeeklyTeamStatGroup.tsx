"use client";
import { HStack } from "@chakra-ui/react";
import League from "../../../classes/custom/League";
import Matchup from "../../../classes/custom/Matchup";
import { OrdinalStatInfo } from "../../../classes/custom/OrdinalStatInfo";
import MemberWeekStatCard from "../../cards/statcards/MemberWeekStatCard";
import WeekStatWithLineupChartCard from "../../cards/statcards/MemberWeekStatCard";

interface MyProps {
  league?: League;
  memberId: number;
}

export default function TeamStatGroup(props: MyProps) {
  let member;
  let bestWeek;
  let worstWeek;
  let closestMatchup;
  let furthestMatchup;
  let notableWeeks;

  if (props.league?.settings != undefined) {
    member = props.league.members.get(props.memberId);
    notableWeeks = props.league.getMemberNotableWeeks(props.memberId);
    bestWeek = (notableWeeks.bestWeek as unknown as Matchup).getMemberSide(
      props.memberId
    );
    worstWeek = (notableWeeks.worstWeek as unknown as Matchup).getMemberSide(props.memberId);
    closestMatchup = notableWeeks.closestGame as unknown as Matchup;
    furthestMatchup = notableWeeks.furthestGame as unknown as Matchup;
  }

  return (
    <HStack spacing={3} maxWidth="inherit">
      {/* <MatchupStatCard
        isLoaded={props.league?.settings != undefined}
        player={undefined}
        playerDetails={undefined}
        mainStat={undefined}
        title={undefined}
        isGoodThing={undefined}
      /> */}

      <MemberWeekStatCard
        title={"Best Week"}
        isLoaded={props.league?.settings != undefined}
        matchupSide={bestWeek}
        memberId={props.memberId}
        mainStat={`${bestWeek?.pf.toFixed(2)} PF`}
        subStat={`Week ${bestWeek?.weekNumber}`}
      />
      <MemberWeekStatCard
        title={"Worst Week"}
        isLoaded={props.league?.settings != undefined}
        matchupSide={worstWeek}
        memberId={props.memberId}
        mainStat={`${worstWeek?.pf.toFixed(2)} PF`}
        subStat={`Week ${worstWeek?.weekNumber}`}
      />
      <MemberWeekStatCard
        title={"Closest Matchup"}
        isLoaded={props.league?.settings != undefined}
        matchupSide={closestMatchup?.getMemberSide(props.memberId)}
        memberId={props.memberId}
        mainStat={`${closestMatchup?.getMargin().toFixed(2)} Diff`}
        subStat={`Week ${closestMatchup?.weekNumber}`}
      />
      <MemberWeekStatCard
        title={"Furthest Matchup"}
        isLoaded={props.league?.settings != undefined}
        matchupSide={furthestMatchup?.getMemberSide(props.memberId)}
        memberId={props.memberId}
        mainStat={`${furthestMatchup?.getMargin().toFixed(2)} Diff`}
        subStat={`Week ${furthestMatchup?.weekNumber}`}
      />

      {/* <MatchupSideStatCard
        statName={"Gut Points"}
        isLoaded={props.league?.settings != undefined}
        statRank={ordinal_suffix_of(gutpointRank?.rank!)}
        statValue={member?.stats.gp.toFixed(2)}
        isGoodThing={gutpointRank?.aboveAverage}
      /> */}
    </HStack>
  );
}

function getMemberStats(stats: OrdinalStatInfo[], memberId: number) {
  let memberStat;
  stats.forEach((stat) => {
    if (stat.rosterId == memberId) {
      memberStat = stat;
    }
  });

  return memberStat;
}
