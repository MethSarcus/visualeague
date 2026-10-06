import { HStack, Text, Tooltip, VStack } from "@chakra-ui/react";
import { DatabasePlayer } from "../../../classes/custom/Player";
import { TradedPick } from "../../../classes/sleeper/DraftPick";
import DraftPickTransaction from "./DraftPickTransaction";
import FaabTransaction from "./FaabTransaction";
import PlayerTransaction from "./PlayerTransaction";

interface MyProps {
  rosterId: number
  ownerName: string
  playerAdds?: DatabasePlayer[]
  draftPickAdds?: TradedPick[]
  playerDrops?: DatabasePlayer[]
  draftPickDrops?: TradedPick[]
  faab?: number
  // Net points the received players scored minus the sent players since the trade
  netPoints?: number
  outcome?: 'winner' | 'loser' | 'even'
}

const OUTCOME_COLOR = {winner: 'green.300', loser: 'red.300', even: 'white'}

export default function TradeSide(props: MyProps) {
  const outcomeColor = OUTCOME_COLOR[props.outcome ?? 'even']
  return (
    <VStack align="stretch" spacing={2} borderStart="solid" borderStartWidth={"medium"} borderStartColor={outcomeColor} pl={2}>
      <HStack justify="space-between" spacing={3}>
        <Text as={'b'} size={'xs'}>{props.ownerName}</Text>
        {props.netPoints !== undefined && (
          <Tooltip hasArrow label="Net points scored by players received minus players sent since the trade">
            <Text fontSize="xs" fontWeight="bold" color={outcomeColor}>
              {props.netPoints > 0 ? '+' : ''}{props.netPoints.toFixed(2)} pts
            </Text>
          </Tooltip>
        )}
      </HStack>
      {props.playerAdds && props.playerAdds.map(player => <PlayerTransaction key={`add_${player?.details?.player_id}`} player={player.details} added={true}/>)}
      {props.draftPickAdds && props.draftPickAdds.map(pick => <DraftPickTransaction key={`add_${pick.season}_${pick.round}_${pick.roster_id}`} pick={pick} added={true}/>)}
      {props.faab && props.faab > 0 && <FaabTransaction cash={props.faab}/>}

      {props.playerDrops && props.playerDrops.map(player => <PlayerTransaction key={`drop_${player?.details?.player_id}`} player={player?.details} added={false}/>)}
      {props.draftPickDrops && props.draftPickDrops.map(pick => <DraftPickTransaction key={`drop_${pick.season}_${pick.round}_${pick.roster_id}`} pick={pick} added={false}/>)}
      {props.faab && props.faab < 0 && <FaabTransaction cash={props.faab}/>}
      
    </VStack>
  );
};
