"use client";
import { Box, Flex, HStack, SimpleGrid, Spacer } from "@chakra-ui/react";
import { useContext } from "react";
import League from "../../../classes/custom/League";
import { OrdinalStatInfo } from "../../../classes/custom/OrdinalStatInfo";
import { PlayerScores, SleeperPlayerDetails } from "../../../classes/custom/Player";
import { PlayerDetailsContext } from "../../../contexts/PlayerDetailsContext";
import { PlayerScoresContext } from "../../../contexts/PlayerScoresContext";
import { POSITION } from "../../../utility/rosterFunctions";
import GenericStatCard from "../../cards/statcards/GenericStatCard";
import TeamPlayerStatCard from "../../cards/statcards/TeamPlayerStatCard";
import TeamStatCard from "../../cards/statcards/TeamStatCard";

interface MyProps {
  league?: League;
  memberId: number;
  filteredPositions?: POSITION[]
}

const TeamPlayerStatGroup = (props: MyProps) => {
  const [playerScoresContext, setPlayerInfoContext] = useContext(PlayerScoresContext) as [Map<string, PlayerScores>, any];
  const [playerDetailsContext, setPlayerDetailsContext] = useContext(PlayerDetailsContext) as [Map<string, SleeperPlayerDetails>, any];
  if (props.league?.settings == undefined || playerScoresContext == null) return <div>Loading...</div>;
  const member = props.league?.members.get(props.memberId);
  let bestPlayer;
  let leastConsistent;
  let lowestAvgScorer;
  let mostConsistent;
  let leastPredictionError;
  let mostPredictionError;

  if (member) {
    let notablePlayers = member?.getNotablePlayers();
    bestPlayer = notablePlayers.bestPlayer;
    leastConsistent = notablePlayers.leastConsistent;
    lowestAvgScorer = notablePlayers.lowestAvgScorer;
    mostConsistent = notablePlayers.mostConsistent;
    leastPredictionError = notablePlayers.mostAccuratePredictions;
    mostPredictionError = notablePlayers.leastAccuratePredictions;
  }
  return (
    <HStack spacing={3} maxWidth="inherit" align={"stretch"}>
      <TeamPlayerStatCard
        title={"MVP"}
        player={bestPlayer}
        playerDetails={playerDetailsContext?.get(bestPlayer?.id!)}
        mainStat={`${bestPlayer?.points_scored.toFixed(2)} PF`}
        subStat={`${bestPlayer?.avgPointsPerStart.toFixed(2)} Avg`}
        isLoaded={true}
        isGoodThing={true}
      />
      <TeamPlayerStatCard
        title={"LVP"}
        player={lowestAvgScorer}
        playerDetails={playerDetailsContext?.get(lowestAvgScorer?.id!)}
        mainStat={`${lowestAvgScorer?.avgPointsPerStart.toFixed(2)} Avg PF`}
        isLoaded={true}
        isGoodThing={false}
      />
      <TeamPlayerStatCard
        title={"Least Consistent"}
        player={leastConsistent}
        playerDetails={playerDetailsContext?.get(leastConsistent?.id!)}
        mainStat={`${leastConsistent?.stdDev.toFixed(2)} Std Dev`}
        isLoaded={true}
        isGoodThing={true}
      />

      <TeamPlayerStatCard
        title={"Most Consistent"}
        player={mostConsistent}
        playerDetails={playerDetailsContext?.get(mostConsistent?.id!)}
        mainStat={`${mostConsistent?.stdDev.toFixed(2)} Std Dev`}
        isLoaded={true}
        isGoodThing={true}
      />
      <TeamPlayerStatCard
        title={"Most Predictable"}
        player={leastPredictionError}
        playerDetails={playerDetailsContext?.get(leastPredictionError?.id!)}
        mainStat={`${leastPredictionError?.rootMeanSquareError.toFixed(
          2
        )} RSME`}
        isLoaded={true}
        isGoodThing={true}
      />
            <TeamPlayerStatCard
        title={"Least Predictable"}
        player={mostPredictionError}
        playerDetails={playerDetailsContext?.get(mostPredictionError?.id!)}
        mainStat={`${mostPredictionError?.rootMeanSquareError.toFixed(
          2
        )} RSME`}
        isLoaded={true}
        isGoodThing={true}
      />
    </HStack>
  );
}

export default TeamPlayerStatGroup
