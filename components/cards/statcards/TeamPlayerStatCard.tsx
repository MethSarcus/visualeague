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
import {SleeperPlayerDetails } from "../../../classes/custom/Player";
import SeasonPlayer from "../../../classes/custom/SeasonPlayer";

type MyProps = {
  player: SeasonPlayer | undefined;
  playerDetails: SleeperPlayerDetails | undefined;
  mainStat: String | undefined;
  subStat?: String | undefined
  title: String | undefined;
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
      minW={"200px"}
      minH={"175px"}
    >
      <Box fontWeight="bold" fontSize={"1.2em"} color={"textTheme.highEmphasis"}>
        {props.title}
      </Box>

      <Box fontWeight="bold" fontSize={"1em"} color={"textTheme.mediumEmphasis"}>
        {props.playerDetails?.first_name} {props.playerDetails?.last_name}
      </Box>

      <Avatar
        my={2}
        size={"md"}
        borderWidth={"1px"}
        borderColor={"grey"}
        src={isNaN(+props.player?.id!) ? `https://sleepercdn.com/images/team_logos/nfl/${props.player?.id.toLowerCase()}.png` : `https://sleepercdn.com/content/nfl/players/${props.player?.id}.jpg`}
      />

      <Text
        fontSize={".9em"}
        fontWeight={"medium"}
        color={"textTheme.highEmphasis"}
      >
        {props.mainStat}
      </Text>
      <Text
        fontSize={".8em"}
        fontWeight="light"
        color={"textTheme.mediumEmphasis"}
      >
        {props.subStat}
      </Text>
    </Box>
  );
};

export default TeamStatCard;
