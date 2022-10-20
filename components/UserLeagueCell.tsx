import { Avatar, Box, Button, Center, Tag, TagLabel } from "@chakra-ui/react";
import { useRouter } from "next/router";
import React from "react";
import { LeagueSettings } from "../classes/sleeper/LeagueSettings";
import { getLeagueReceptionScoringType } from "../utility/rosterFunctions";

type MyProps = {
  league: LeagueSettings
};

const viewLeague = () => {

};

const UserLeagueCell = (props: MyProps) => {
  const router = useRouter();

  return (
    <Center borderRadius="6" bg={"surface.1"} p={2} px={3}>
      <Avatar
        src={`https://sleepercdn.com/avatars/thumbs/${props.league.avatar}`}
        size="xs"
        name={props.league.name}
        ml={-1}
        mr={2}
      />
      <Box as="p">{props.league.name}</Box>
      <Button ml={2} variant="outline" size="xs" colorScheme={"primary"} onClick={() => {router.push({
                  pathname: "/league/" + props.league.league_id
                })}}>
        View
      </Button>
    </Center>
  );
};

export default UserLeagueCell;
