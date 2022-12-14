import { Wrap, WrapItem } from "@chakra-ui/react";
import React from "react";
import { LeagueSettings } from "../classes/sleeper/LeagueSettings";
import LeagueCard from "./cards/LeagueCard";

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
              <LeagueCard league={league} variant={""} size={""} />
            </WrapItem>
          );
        })}
      </Wrap>
    );
  }
}
