"use client";
import {
  Avatar,
  Box,
  Center,
  Container,
  Flex,
  Text,
  SkeletonCircle,
  SkeletonText,
} from "@chakra-ui/react";
import { SleeperPlayerDetails } from "../../../classes/custom/Player";
import SeasonPlayer from "../../../classes/custom/SeasonPlayer";

type MyProps = {
  player: SeasonPlayer | undefined;
  playerDetails: SleeperPlayerDetails | undefined;
  mainStat: String | undefined;
  title: String | undefined;
  subStat: String | undefined;
  isLoaded: boolean;
  isGoodThing: boolean | undefined;
};

const TeamStatCard = (props: MyProps) => {
  let borderColor = "#B00020";
  if (props.isGoodThing == null || props.isGoodThing == undefined) {
    borderColor = "grey";
  } else if (props.isGoodThing == true) {
    borderColor = "rgb(151,245,143, .8)";
  }

  return (
    <Box
      py={2}
      px={5}
      dropShadow="2xl"
      textAlign={"center"}
      border={"1px"}
      borderRadius={4}
      boxShadow={"2xl"}
    >
      <Box fontWeight="bold" fontSize={".9em"} color={"textTheme.highEmphasis"}>
        {props.title}
      </Box>

      <Avatar
        my={2}
        size={"md"}
        borderWidth={"1px"}
        borderColor={"grey"}
        src={`https://sleepercdn.com/content/nfl/players/${props.player?.id}.jpg`}
      />
      <Text color={"textTheme.highEmphasis"}>
        {props.playerDetails?.first_name} {props.playerDetails?.last_name}
      </Text>

      <Text
        fontSize={".7em"}
        fontWeight={"medium"}
        color={"textTheme.highEmphasis"}
      >
        {props.mainStat}
      </Text>
      <Text
        fontSize={".6em"}
        fontWeight="light"
        color={"textTheme.mediumEmphasis"}
      >
        {props.subStat}
      </Text>
    </Box>
  );
};

export default TeamStatCard;
