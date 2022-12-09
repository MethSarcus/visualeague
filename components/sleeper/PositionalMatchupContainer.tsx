"use client";
import {
  Flex,
  Avatar,
  Center,
  Box,
  Text,
  useMultiStyleConfig,
  ModalHeader,
  Circle,
  Square,
  Spinner,
} from "@chakra-ui/react";
import { useContext } from "react";
import LeagueMember from "../../classes/custom/LeagueMember";
import Matchup from "../../classes/custom/Matchup";
import { MatchupPlayer } from "../../classes/custom/MatchupPlayer";
import { Context } from "../../contexts/Context";
import { project_colors } from "../../utility/project_colors";
import { LINEUP_POSITION } from "../../utility/rosterFunctions";
import PositionBadge from "../PositionBadges/PositionBadge";
import SleeperLineupBadge from "../PositionBadges/SleeperLineupBadge";
import InvertedMatchupHeaderTeam from "./InvertedMatchupHeaderTeam";
import MatchupHeaderTeam from "./MatchupHeaderTeam";
import PositionalMatchupPlayer, {
  InversePositionalMatchupPlayer,
} from "./PositionalMatchupPlayer";

interface MyProps {
  position: LINEUP_POSITION;
  homePlayer: MatchupPlayer;
  awayPlayer: MatchupPlayer;
}

export default function PositionalMatchupContainer(props: MyProps) {
  const [context, setContext] = useContext(Context);
  let homePlayerDetails
  let awayPlayerDetails


  if (context.playerDetails) {
    homePlayerDetails = context.playerDetails.get(
      props.homePlayer.playerId
    );
  
    awayPlayerDetails = context.playerDetails.get(
      props.awayPlayer.playerId
    );
  
  }


  return (
    <Center borderBottom={"1px"} borderColor={project_colors.sleeper.border_color}>
      <PositionalMatchupPlayer
        player={props.homePlayer}
        playerDetails={homePlayerDetails}
      />
      <Box mx={2} zIndex={4}>
        <SleeperLineupBadge slotPosition={props.position} />
      </Box>

      <InversePositionalMatchupPlayer
        player={props.awayPlayer}
        playerDetails={awayPlayerDetails}
      />
    </Center>
  );
}

