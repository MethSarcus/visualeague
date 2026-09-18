"use client";
import {
  Avatar,
  Box,
  Text,
} from "@chakra-ui/react";
import {SleeperPlayerDetails } from "../../../classes/custom/Player";
import SeasonPlayer from "../../../classes/custom/SeasonPlayer";
import { getGoodBadBorderColor, getPlayerAvatarSrc } from "../../../utility/statCardHelpers";

type MyProps = {
  player: SeasonPlayer | undefined;
  playerDetails: SleeperPlayerDetails | undefined;
  mainStat: String | undefined;
  subStat?: String | undefined
  title: String | undefined;
  isLoaded: boolean;
  isGoodThing: boolean | undefined;
};

const TeamPlayerStatCard = (props: MyProps) => {
  const borderColor = getGoodBadBorderColor(props.isGoodThing);

  return (
    <Box
      py={2}
      px={5}
      dropShadow="2xl"
      textAlign={"center"}
      border={"1px"}
      borderRadius={4}
      boxShadow={"2xl"}
      borderTop="2px"
      borderTopColor={borderColor}
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
        src={getPlayerAvatarSrc(props.player?.id)}
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

export default TeamPlayerStatCard;
