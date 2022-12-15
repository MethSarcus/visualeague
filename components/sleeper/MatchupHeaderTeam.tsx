"use client";
import {
  Flex,
  Avatar,
  Spacer,
  Box,
  Text,
  useMultiStyleConfig,
} from "@chakra-ui/react";
import LeagueMember from "../../classes/custom/LeagueMember";
import { MatchupSide } from "../../classes/custom/MatchupSide";
import { project_colors } from "../../utility/project_colors";

interface MyProps {
  matchupSide: MatchupSide | undefined;
  member: LeagueMember | undefined;
  isWinner: boolean
  size: string;
  variant: string;
  isTie: boolean
}

export default function MatchupHeaderTeam(props: MyProps) {
  const { variant, size, ...rest } = props;

  let ringColor = project_colors.outcomeColor.tie_color;
  if (props.isWinner && props.isTie != true) {
    ringColor = project_colors.statColor.good;
  } else if (props.isWinner == false && props.isTie != true) {
    ringColor = project_colors.statColor.bad;
  }

  return (
    <Flex
      bg="#43495A"
      p={2}
      borderRadius={"15px"}
      border={"solid"}
      borderWidth={"thin"}
      borderColor={"rgb(56,62,80)"}
      fontSize={".7em"}
      minW={"180px"}
      position={"relative"}
    >
      <Avatar
        position={"absolute"}
        ml={-2}
        mt={-7}
        size={"md"}
        borderColor={ringColor}
        borderWidth={2}
        src={props.member?.getTeamAvatar()}
      />
      <Box
        pl={1}
        mt={"auto"}
        mb={"auto"}
        fontWeight={"semibold"}
        color={"#A7BAD0"}
        mr={2}
      >
        <Text
          ml={10}
          mt={-2}
          fontSize={".8em"}
          fontWeight={"semibold"}
          letterSpacing={"tighter"}
        >
          {props.member?.stats.wins}-{props.member?.stats.losses}{" "}
          {`[#${props.member?.stats.overall_rank}]`}
        </Text>
        <Text
          fontWeight={"semibold"}
          mt={6}
          fontSize={".8em"}
          color={"#A7BAD0"}
          lineHeight="10px"
        >
          @{props.member?.userDetails.display_name}
        </Text>
        <Text fontWeight={"semibold"} color={"white"}>
          {props.member?.teamName}
        </Text>
      </Box>
      <Spacer />
      <Flex
        fontSize={"1em"}
        fontWeight={"semibold"}
        position={"absolute"}
        noOfLines={2}
        mr={3.5}
        my={"auto"}
        right={0}
        p={0}
        textAlign={"end"}
      >
        <Text fontSize={"1.2em"} color={"#FBFBFB"} mt={1}>
          {props.matchupSide?.pf.toFixed(2) ?? "0.00"}
        </Text>
        <Text color={"#A7BAD0"} fontWeight={"semibold"} fontSize={".7em"}>
          {props.matchupSide?.projectedScore.toFixed(2) ?? "0.00"}
        </Text>
      </Flex>
    </Flex>
  );
}
