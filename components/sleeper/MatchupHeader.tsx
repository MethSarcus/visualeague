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
} from "@chakra-ui/react";
import { useContext } from "react";
import LeagueMember from "../../classes/custom/LeagueMember";
import Matchup from "../../classes/custom/Matchup";
import MatchupInterface from "../../classes/custom/MatchupInterface";
import { Context } from "../../contexts/Context";
import { project_colors } from "../../utility/project_colors";
import InvertedMatchupHeaderTeam from "./InvertedMatchupHeaderTeam";
import MatchupHeaderTeam from "./MatchupHeaderTeam";

interface MyProps {
  matchup: MatchupInterface | undefined;
}

export default function MatchupHeader(props: MyProps) {
  const [context, setContext] = useContext(Context);
  if (context.settings == undefined)
    return (
      <ModalHeader>
        <div>Loading</div>
      </ModalHeader>
    );
  let homeTeam = props.matchup?.homeTeam;
  let awayTeam = props.matchup?.awayTeam;
  let homeTeamWon;
  let homeMember;
  let awayMember;

  homeMember = context.getMember(homeTeam?.roster_id) as LeagueMember;
  awayMember = context.getMember(awayTeam?.roster_id) as LeagueMember;

  return (
    <ModalHeader>
      <Center>Week {props.matchup?.weekNumber}</Center>
      <Flex mt={2} align={"stretch"}>
        <MatchupHeaderTeam
          matchupSide={props.matchup?.homeTeam}
          isWinner={
            props.matchup?.homeTeam.roster_id == props.matchup?.winnerRosterId
          }
          isTie={props.matchup?.isTie ?? false}
          member={homeMember}
          size={"sm"}
          variant={"default"}
          isByeWeek={props.matchup?.isByeWeek ?? false}
        />
        <Circle
          zIndex={5}
          bg={"#1A202E"}
          color={"#A7BAD0"}
          size={"30px"}
          fontSize={".7em"}
          p={1}
          mx={-3}
          fontWeight="semibold"
        >
          <Center textAlign={"center"}>VS</Center>
        </Circle>
        <InvertedMatchupHeaderTeam
          variant={"inverted"}
          matchupSide={props.matchup?.awayTeam}
          isWinner={props.matchup?.awayTeam?.roster_id == props.matchup?.winnerRosterId}
          member={awayMember}
          size={"lg"}
          isTie={props.matchup?.isTie ?? false}
          isByeWeek={props.matchup?.isByeWeek}
        />
      </Flex>
    </ModalHeader>
  );
}
