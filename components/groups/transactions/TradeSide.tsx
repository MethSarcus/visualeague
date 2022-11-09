import { Text, VStack } from "@chakra-ui/react";
import { SleeperPlayerDetails } from "../../../classes/custom/Player";
import { TradedPick } from "../../../classes/sleeper/DraftPick";
import DraftPickTransaction from "./DraftPickTransaction";
import FaabTransaction from "./FaabTransaction";
import PlayerTransaction from "./PlayerTransaction";

interface MyProps {
  rosterId: number
  ownerName: string
  playerAdds?: SleeperPlayerDetails[]
  draftPickAdds?: TradedPick[]
  playerDrops?: SleeperPlayerDetails[]
  draftPickDrops?: TradedPick[]
  faab?: number
}

export default function TradeSide(props: MyProps) {
  return (
    <VStack align="stretch" spacing={2} borderStart="solid" borderStartWidth={"medium"} borderStartColor="white" pl={2}>
      <Text as={'b'} size={'xs'}>{`${props.ownerName}'s Roster`}</Text>
      {props.playerAdds && props.playerAdds.map(player => <PlayerTransaction key={`add_${player.player_id}`} player={player} added={true}/>)}
      {props.draftPickAdds && props.draftPickAdds.map(pick => <DraftPickTransaction key={`add_${pick.season}_${pick.round}_${pick.roster_id}`} pick={pick} added={true}/>)}
      {props.faab && props.faab > 0 && <FaabTransaction cash={props.faab}/>}

      {props.playerDrops && props.playerDrops.map(player => <PlayerTransaction key={`drop_${player.player_id}`} player={player} added={false}/>)}
      {props.draftPickDrops && props.draftPickDrops.map(pick => <DraftPickTransaction key={`drop_${pick.season}_${pick.round}_${pick.roster_id}`} pick={pick} added={false}/>)}
      {props.faab && props.faab < 0 && <FaabTransaction cash={props.faab}/>}
      
    </VStack>
  );
};
