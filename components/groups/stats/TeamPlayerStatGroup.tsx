"use client";
import { Box, Flex, HStack, SimpleGrid, Spacer } from "@chakra-ui/react";
import League from "../../../classes/custom/League";
import { OrdinalStatInfo } from "../../../classes/custom/OrdinalStatInfo";
import GenericStatCard from "../../cards/statcards/GenericStatCard";
import TeamPlayerStatCard from "../../cards/statcards/TeamPlayerStatCard";
import TeamStatCard from "../../cards/statcards/TeamStatCard";

interface MyProps {
  league?: League;
  memberId: number;
}

export default function TeamPlayerStatGroup(props: MyProps) {
    if (props.league?.settings == undefined) return <div>Loading...</div>
  const member = props.league?.members.get(props.memberId)
  let bestPlayer
  let bestPlayerDetails

  if (member) {
    bestPlayer = member.getBestPlayer()
    bestPlayer.calcAdvancedStats()
    bestPlayerDetails = props.league.playerDetails.get(bestPlayer.id)
  }
  return (
    <HStack spacing={3} maxWidth="inherit">
      <TeamPlayerStatCard
        title={"MVP"}
        player={bestPlayer}
        playerDetails={bestPlayerDetails}
        mainStat={`${bestPlayer?.points_scored.toFixed(2)} PF`}
        subStat={bestPlayerDetails?.full_name}
        isLoaded={true}
        isGoodThing={true}
      />
            <TeamPlayerStatCard
        title={"Most Consistent"}
        player={bestPlayer}
        playerDetails={bestPlayerDetails}
        mainStat={`${bestPlayer?.stdDev.toFixed(2)} Std`}
        subStat={bestPlayer?.avgPointsPerStart.toFixed(2)}
        isLoaded={true}
        isGoodThing={true}
      />
            <TeamPlayerStatCard
        title={"Worst Player"}
        player={bestPlayer}
        playerDetails={bestPlayerDetails}
        mainStat={`${bestPlayer?.points_scored.toFixed(2)} PF`}
        subStat={bestPlayerDetails?.full_name}
        isLoaded={true}
        isGoodThing={true}
      />
            <TeamPlayerStatCard
        title={"Overachiever"}
        player={bestPlayer}
        playerDetails={bestPlayerDetails}
        mainStat={`${bestPlayer?.points_scored.toFixed(2)} PF`}
        subStat={bestPlayerDetails?.full_name}
        isLoaded={true}
        isGoodThing={true}
      />
            <TeamPlayerStatCard
        title={"Underachiever"}
        player={bestPlayer}
        playerDetails={bestPlayerDetails}
        mainStat={`${bestPlayer?.points_scored.toFixed(2)} PF`}
        subStat={bestPlayerDetails?.full_name}
        isLoaded={true}
        isGoodThing={true}
      />
    </HStack>
  );
}
