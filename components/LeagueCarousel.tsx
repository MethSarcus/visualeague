import { WrapItem, Wrap } from "@chakra-ui/react";
import React from "react";
import { LeagueSettings } from "../interfaces/sleeper_api/LeagueSettings";
import LeagueCard from "./LeagueCard";

type MyProps = { leagues: LeagueSettings[] };
export default class LeagueCarousel extends React.Component<MyProps> {
  constructor(props: MyProps) {
    super(props);
  }

  render() {
    return (
      <Wrap mt={2}>
        {this.props.leagues.map((league) => {
          return (
            <WrapItem key={league.league_id}>
              <LeagueCard league={league} />
            </WrapItem>
          );
        })}
      </Wrap>
    );
  }
}
