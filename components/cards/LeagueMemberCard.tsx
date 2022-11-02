import {
  Button,
  Text,
  Stack,
  Spacer,
  ButtonGroup,
  Box,
  useStyleConfig,
  useMultiStyleConfig,
  Center,
  Avatar,
  Heading,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import LeagueMember from "../../classes/custom/LeagueMember";
import { LeagueSettings } from "../../classes/sleeper/LeagueSettings";
import { getLeagueReceptionScoringType } from "../../utility/rosterFunctions";
import ScoringPopover from "../ScoringPopover";

type MyProps = {
  member: LeagueMember;
};

const LeagueMemberCard = (props: MyProps) => {
  return (
      <Button size={"xl"} p={3} colorScheme="primary" leftIcon={<Avatar
        src={`https://sleepercdn.com/avatars/thumbs/${props.member.avatar}`}
        size="md"
        name={props.member.name}
      />}>
          {`${props.member.name} (${props.member.stats.wins}-${props.member.stats.losses})`}
      </Button>
  );
};

export default LeagueMemberCard;
