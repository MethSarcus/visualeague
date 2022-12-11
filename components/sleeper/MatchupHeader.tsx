"use client"
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
import { Context } from "../../contexts/Context";
import { project_colors } from "../../utility/project_colors";
import InvertedMatchupHeaderTeam from "./InvertedMatchupHeaderTeam";
import MatchupHeaderTeam from "./MatchupHeaderTeam";

interface MyProps {
  matchup: Matchup | undefined;
}

export default function MatchupHeader(props: MyProps) {
  const [context, setContext] = useContext(Context);
  if (context.settings == undefined) return <ModalHeader><div>Loading</div></ModalHeader>
  let homeTeam = props.matchup?.homeTeam;
  let awayTeam = props.matchup?.awayTeam;
  let homeTeamWon;
  let homeMember;
  let awayMember;

  
    homeMember = context.getMember(homeTeam?.roster_id) as LeagueMember;
    awayMember = context.getMember(awayTeam?.roster_id) as LeagueMember;
  if (
    props.matchup?.winnerRosterId != homeMember?.roster.roster_id &&
    !props.matchup?.isTie
  ) {
    homeTeamWon = false;
  } else if (!props.matchup.isTie) {
    homeTeamWon = true;
  }

  return (
    <ModalHeader>
      <Center>
        Week {props.matchup?.weekNumber}
      </Center>
    <Center mt={2}>
      <MatchupHeaderTeam
                  matchupSide={props.matchup?.homeTeam}
                  isWinner={homeTeamWon}
                  member={homeMember}
                  size={"sm"} variant={"default"}      />
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
        <Center textAlign={"center"}>
        VS
        </Center>
        
      </Circle>
      <InvertedMatchupHeaderTeam
        variant={"inverted"}
        matchupSide={props.matchup?.awayTeam!}
        isWinner={!homeTeamWon}
        member={awayMember}
        size={"lg"}
      />
    </Center>
    </ModalHeader>
  );
}
