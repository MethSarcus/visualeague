import {
  Button,
  Text,
  Stack,
  Spacer,
  ButtonGroup,
  Box,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { LeagueSettings } from "../interfaces/sleeper_api/LeagueSettings";
import { getLeagueReceptionScoringType } from "../utility/rosterFunctions";
import ScoringPopover from "./ScoringPopover";

type MyProps = {
  league: LeagueSettings;
};

const LeagueCard = (props: MyProps) => {
  const router = useRouter();

  function onSub(e: React.SyntheticEvent) {
    e.preventDefault();
    router.push({
      pathname:
        "/user/" + router.query.username + "/draft/" + props.league.draft_id,
    });
  }

  const settingsString = getLeagueReceptionScoringType(props.league);

  return (
    <Stack
      spacing={1}
      direction="column"
      boxShadow={"lg"}
      p="3"
      alignContent={"center"}
      alignItems={"center"}
      rounded={"md"}
      bg="surface_google.2"
      textColor={"brand.on_surface"}
    >
      <Box as="b" fontSize="sm" textAlign={"center"}>
        {props.league.name}
      </Box>
      <Stack direction={"row"}>
        <Text fontSize="xs">{settingsString.pprString}</Text>
        <Spacer />
        <Text fontSize="xs">{settingsString.numQbString}</Text>
        <Spacer />
        <Text fontSize="xs">{settingsString.leagueTypeString}</Text>
      </Stack>
      <ButtonGroup spacing={1}>
        <Button
          onClick={onSub}
          variant="outline"
          colorScheme="primary_google"
          size="xs"
        >
          View Draft
        </Button>
        <ScoringPopover league={props.league} />
      </ButtonGroup>
    </Stack>
  );
};

export default LeagueCard;
