"use client";
import {
  Flex,
  Avatar,
  Spacer,
  Box,
  Text,
  useMultiStyleConfig,
  HStack,
  SimpleGrid,
} from "@chakra-ui/react";
import LeagueMember from "../../classes/custom/LeagueMember";
import { MatchupPlayer } from "../../classes/custom/MatchupPlayer";
import { MatchupSide } from "../../classes/custom/MatchupSide";
import { SleeperPlayerDetails } from "../../classes/custom/Player";
import { project_colors } from "../../utility/project_colors";

interface MyProps {
  player: MatchupPlayer | undefined;
  playerDetails: SleeperPlayerDetails | undefined;
}

export default function PositionalMatchupPlayer(props: MyProps) {
  return (
    <Flex
      py={2}
      fontSize={".7em"}
      position={"relative"}
      align={"stretch"}
      lineHeight={1.3}
      w={"full"}
    >
      <Box>
        <Text as={"p"} color={"white"} fontWeight={"bold"} fontSize={"1.1em"}>
          {props.playerDetails?.first_name.charAt(0) ?? "E"}.{" "}
          {props.playerDetails?.last_name ?? "Slot"}
        </Text>
        <Text
          as={"p"}
          fontWeight={"semibold"}
          color={"white"}
          fontSize={".8em"}
        >
          {props.playerDetails?.fantasy_positions[0] ?? "N/A"}-{props.playerDetails?.team ?? "N/A"}
        </Text>
      </Box>
      <Spacer />
      <Box noOfLines={2} textAlign={"end"}>
        <Text as={"p"} color={"white"} fontWeight={"bold"} fontSize={"1.1em"}>
          {props.player?.score.toFixed(2)}
        </Text>
        <Text
          as={"p"}
          color={project_colors.sleeper.text_grey}
          fontWeight={"semibold"}
          fontSize={".8em"}
        >
          {props.player?.projectedScore.toFixed(2)}
        </Text>
      </Box>
    </Flex>
  );
}

export function InversePositionalMatchupPlayer(props: MyProps) {
  return (
    <Flex
      py={2}
      fontSize={".7em"}
      position={"relative"}
      align={"stretch"}
      lineHeight={1.3}
      w={"full"}
      flexDirection={"row-reverse"}
    >
      <Box textAlign={"end"}>
        <Text as={"p"} color={"white"} fontWeight={"bold"} fontSize={"1.1em"}>
          {props.playerDetails?.first_name.charAt(0)}.{" "}
          {props.playerDetails?.last_name}
        </Text>
        <Text
          as={"p"}
          fontWeight={"semibold"}
          color={"white"}
          fontSize={".8em"}
        >
          {props.playerDetails?.fantasy_positions[0]}-{props.playerDetails?.team}
        </Text>
      </Box>
      <Spacer />
      <Box noOfLines={2} textAlign={"start"}>
        <Text as={"p"} color={"white"} fontWeight={"bold"} fontSize={"1.1em"}>
          {props.player?.score.toFixed(2)}
        </Text>
        <Text
          as={"p"}
          color={project_colors.sleeper.text_grey}
          fontWeight={"semibold"}
          fontSize={".8em"}
        >
          {props.player?.projectedScore.toFixed(2)}
        </Text>
      </Box>
    </Flex>
  );
}
