"use client";
import {
  Avatar,
  Box, Button, Center, Modal, ModalOverlay, Text, useDisclosure
} from "@chakra-ui/react";
import { useContext } from "react";
import Matchup from "../../../classes/custom/Matchup";
import { Context } from "../../../contexts/Context";
import { project_colors } from "../../../utility/project_colors";
import MatchupModalBody from "../../MatchupModalBody";

type MyProps = {
  matchup: Matchup | undefined;
  memberId?: number | undefined;
  title: String | undefined;
  mainStat: String | undefined;
  subStat?: String | undefined;
  subSubStat?: String | undefined;

  isLoaded: boolean;
};

const LeagueNotableWeekStatCard = (props: MyProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [context, setContext] = useContext(Context);
  let homeMember;
  let awayMember;

  if (context?.settings != undefined) {
    homeMember = context.members.get(props.matchup?.homeTeam.roster_id);
    awayMember = context.members.get(props.matchup?.awayTeam?.roster_id);
  }
  let homeColor = project_colors.statColor.neutral;
  let awayColor = project_colors.statColor.neutral;
  if (props.matchup?.homeTeam.roster_id == props.matchup?.winnerRosterId) {
    homeColor = project_colors.statColor.good;
    awayColor = project_colors.statColor.bad;
  } else if (
    props.matchup?.homeTeam.roster_id != props.matchup?.winnerRosterId
  ) {
    homeColor = project_colors.statColor.bad;
    awayColor = project_colors.statColor.good;
  }
  return (
    <>
      <Box
        py={2}
        px={5}
        dropShadow="2xl"
        textAlign={"center"}
        border={"1px"}
        borderRadius={4}
        bg={"surface.0"}
        boxShadow={"2xl"}
        minWidth={"150px"}
        minHeight={"125px"}
      >
        <Box
          fontWeight="bold"
          fontSize={"1em"}
          color={"textTheme.highEmphasis"}
        >
          {props.title}
        </Box>
        <Text
          fontSize={".8em"}
          fontWeight="normal"
          mt={1}
          color={"textTheme.mediumEmphasis"}
        >
          Week {props.matchup?.weekNumber}
        </Text>
        <Center>
          <Avatar
            borderColor={homeColor}
            borderWidth={2}
            size={"md"}
            src={`https://sleepercdn.com/avatars/thumbs/${homeMember?.avatar}`}
          />
          <Text
            color={project_colors.sleeper.text_normal}
            fontSize={".7em"}
            mx={2}
          >
            vs
          </Text>
          <Avatar
            borderColor={awayColor}
            borderWidth={2}
            size={"md"}
            src={`https://sleepercdn.com/avatars/thumbs/${awayMember?.avatar}`}
          />
        </Center>

        <Text fontSize={".8em"} color={"textTheme.highEmphasis"}>
          {props.mainStat}
        </Text>
        <Text fontSize={".7em"} color={"textTheme.highEmphasis"}>
          {props.subSubStat}
        </Text>
        <Button
          my={2}
          onClick={onOpen}
          variant={"ghost"}
          colorScheme={"secondary"}
          size={"xs"}
        >
          View
        </Button>
      </Box>

      <Modal size={"sm"} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <MatchupModalBody matchup={props.matchup} onClose={onClose} />
      </Modal>
    </>
  );
};

export default LeagueNotableWeekStatCard;
