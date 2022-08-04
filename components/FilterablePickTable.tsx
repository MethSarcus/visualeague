import { Checkbox, Divider, Heading, Stack } from "@chakra-ui/react";
import axios from "axios";
import React, { useContext, useState } from "react";
import useSWR from "swr";
import { Context } from "../contexts/Context";
import { DraftPick } from "../interfaces/sleeper_api/DraftPick";
import { LeagueSettings } from "../interfaces/sleeper_api/LeagueSettings";
import { getAllLeaguePositions, POSITION } from "../utility/rosterFunctions";
import DraftPickDataTable from "./DraftPickDataTable";

type MyProps = {
  leagues: LeagueSettings[];
  picks: DraftPick[];
  focusedUser: string;
};

const FilterablePickTable = (props: MyProps) => {
  const [includedDrafts, setIncludedDrafts] = useState(
    props.leagues.map((league) => league.draft_id)
  );

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      let newVar = [...includedDrafts];
      if (newVar.includes(event.target.value)) {
        let ind = newVar.indexOf(event.target.value);
        newVar.splice(ind, 1);
        setIncludedDrafts(newVar);
      }
    } else {
      let newVar = [...includedDrafts];
      if (!newVar.includes(event.target.value)) {
        newVar.push(event.target.value);
        setIncludedDrafts(newVar);
      }
    }
  };

  const [includedPositions, setIncludedPositions] = useState(
    getAllLeaguePositions(props.leagues)
  );

  const handlePositionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.checked) {
      let newVar = [...includedPositions];
      if (newVar.includes(event.target.value as POSITION)) {
        let ind = newVar.indexOf(event.target.value as POSITION);
        newVar.splice(ind, 1);
        setIncludedPositions(newVar);
      }
    } else {
      let newVar = [...includedPositions];
      if (!newVar.includes(event.target.value as POSITION)) {
        newVar.push(event.target.value as POSITION);
        setIncludedPositions(newVar);
      }
    }
  };

  return (
    <div>
      <Heading as="h6" size="xs">
        Leagues
      </Heading>
      <Stack direction="row">
        {props.leagues.map((league: LeagueSettings) => {
          return (
            <Checkbox
              key={league.draft_id}
              onChange={handleChange.bind(this)}
              size="sm"
              colorScheme="green"
              value={league.draft_id}
              defaultChecked
            >
              {league.name}
            </Checkbox>
          );
        })}
      </Stack>
      <Divider />
      <Heading as="h6" size="xs">
        Positions
      </Heading>
      <Stack direction="row">
        {getAllLeaguePositions(props.leagues).map((position: string) => {
          return (
            <Checkbox
              key={position}
              onChange={handlePositionChange.bind(this)}
              size="sm"
              colorScheme="green"
              value={position}
              defaultChecked
            >
              {position}
            </Checkbox>
          );
        })}
      </Stack>
      <DraftPickDataTable
        picks={props.picks}
        includedDrafts={includedDrafts}
        includedPositions={includedPositions}
        focusedUser={props.focusedUser}
      />
    </div>
  );
};

export default FilterablePickTable;
