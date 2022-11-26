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
import { MatchupSide } from "../../../classes/custom/MatchupSide";
import { SleeperPlayerDetails } from "../../../classes/custom/Player";
import SeasonPlayer from "../../../classes/custom/SeasonPlayer";
import { Week } from "../../../classes/custom/Week";
import LineupPieChart from "../../charts/LineupPieChart";

type MyProps = {
  matchupSide: MatchupSide | undefined;
  memberId: number | undefined
  mainStat: String | undefined;
  subStat?: String | undefined
  title: String | undefined;
  isLoaded: boolean;
};

const WeekStatCard = (props: MyProps) => {
  return (
    <Box
      py={2}
      px={5}
      dropShadow="2xl"
      textAlign={"center"}
      border={"1px"}
      borderRadius={4}
      boxShadow={"2xl"}
      minWidth={"150px"}
      minHeight={"150px"}

    >
      <Box fontWeight="bold" fontSize={"1.2em"} color={"textTheme.highEmphasis"}>
        {props.title}
      </Box>

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

export default WeekStatCard;
