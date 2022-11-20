import {
    Box, Button, ButtonGroup, Spacer, Stack, Text, useMultiStyleConfig
  } from "@chakra-ui/react";
  import { useRouter } from "next/router";
  import React from "react";
import LeagueMember from "../../classes/custom/LeagueMember";
  import { LeagueSettings } from "../../classes/sleeper/LeagueSettings";
  import { getLeagueReceptionScoringType } from "../../utility/rosterFunctions";
  import ScoringPopover from "../ScoringPopover";
  
  type MyProps = {
    member: LeagueMember;
    variant: string;
    size: string;
  };
  
  const TeamCard = (props: MyProps) => {
    const { variant, size, ...rest } = props;
    const styles = useMultiStyleConfig("LeagueCard", { variant, size });
    const router = useRouter();
  
    return (
      <Stack
        spacing={1}
        direction="column"
        boxShadow={"lg"}
        p="3"
        alignContent={"center"}
        alignItems={"center"}
        rounded={"md"}
        bg="surface.2"
        textColor={"white"}
      >
        <Box as="b" fontSize="sm" textAlign={"center"}  __css={styles.league_name}>
          {props.member.name}
        </Box>
        <Stack direction={"row"}>
          <Text fontSize="xs">{"1st PF"}</Text>
          <Spacer />
          <Text fontSize="xs">{"2nd PA"}</Text>
          <Spacer />
          <Text fontSize="xs">{"3rd PP"}</Text>
        </Stack>
        <ButtonGroup spacing={1}>
          <Button
            variant="outline"
            colorScheme="primary"
            size="xs"
          >
            View Draft
          </Button>
        </ButtonGroup>
      </Stack>
    );
  };
  
  export default TeamCard;
  