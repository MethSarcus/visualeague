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
  let playerDetails = props.league.playerDetails

  let bestPlayer
  let highestAvgScorer
  let lowestAvgScorer
  let mostConsistent
  let leastPredictionError
  

  if (member) {
    let notablePlayers = member?.getNotablePlayers()
    bestPlayer = notablePlayers.bestPlayer
    highestAvgScorer = notablePlayers.highestAvgScorer
    lowestAvgScorer = notablePlayers.lowestAvgScorer
    mostConsistent = notablePlayers.mostConsistent
    leastPredictionError = notablePlayers.mostAccuratePredictions
    
  }
  return (
    <HStack spacing={3} maxWidth="inherit">
      <TeamPlayerStatCard
        title={"MVP"}
        player={bestPlayer}
        playerDetails={playerDetails.get(bestPlayer?.id!)}
        mainStat={`${bestPlayer?.points_scored.toFixed(2)} PF`}
        isLoaded={true}
        isGoodThing={true}
      />
                 <TeamPlayerStatCard
        title={"Highest Avg"}
        player={highestAvgScorer}
        playerDetails={playerDetails.get(highestAvgScorer?.id!)}
        mainStat={`${highestAvgScorer?.avgPointsPerStart.toFixed(2)} Avg PF`}
        isLoaded={true}
        isGoodThing={true}
      />
      <TeamPlayerStatCard
        title={"LVP"}
        player={lowestAvgScorer}
        playerDetails={playerDetails.get(lowestAvgScorer?.id!)}
        mainStat={`${lowestAvgScorer?.avgPointsPerStart.toFixed(2)} Avg PF`}
        isLoaded={true}
        isGoodThing={false}
      />
      <TeamPlayerStatCard
        title={"Most Consistent"}
        player={mostConsistent}
        playerDetails={playerDetails.get(mostConsistent?.id!)}
        mainStat={`${mostConsistent?.stdDev.toFixed(2)} Std Dev`}
        isLoaded={true}
        isGoodThing={true}
      />
      <TeamPlayerStatCard
        title={"Most Predictable"}
        player={leastPredictionError}
        playerDetails={playerDetails.get(leastPredictionError?.id!)}
        mainStat={`${leastPredictionError?.rootMeanSquareError.toFixed(2)} RSME`}
        isLoaded={true}
        isGoodThing={true}
      />
    </HStack>
  );
}
