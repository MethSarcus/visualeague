
import { Box, Wrap, WrapItem } from "@chakra-ui/react";
import { LeagueSettings } from "../classes/sleeper/LeagueSettings";
import LeagueCard from "./cards/LeagueCard";

type MyProps = { leagues: LeagueSettings[], filteredLeagueStates: string[], title: string };

const LeaguesSection = (props: MyProps) => {
  return (
    <Box borderRadius={5} p={4} bg={"surface_google.1"}>
      <Box as="h1" color={"brand.on_background"}>
        {props.title}
      </Box>
      <Wrap mt={2}>
        {props.leagues.filter((league: LeagueSettings) => {
          return !props.filteredLeagueStates.includes(league.status);
        }).map((league) => {
          return (
            <WrapItem key={league.league_id}>
              <LeagueCard league={league} variant={""} size={""} />
            </WrapItem>
          );
        })}
      </Wrap>
    </Box>
  );
};

export default LeaguesSection
