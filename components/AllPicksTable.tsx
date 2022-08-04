import {
  Table,
  TableContainer,
  Tbody,
  Td,
  Tfoot,
  Th,
  Thead,
  Tr,
} from "@chakra-ui/react";
import axios from "axios";
import React, { useContext } from "react";
import useSWR from "swr";
import { Context } from "../contexts/Context";
import { DraftPick } from "../interfaces/sleeper_api/DraftPick";

const fetcher = (url: string) => axios.get(url).then((res) => res.data);
const AllPicksTable = () => {
  const [context, setContext] = useContext(Context);
  const { data, error } = useSWR(`/api/picks/${context}`, fetcher);

  if (error) return <div>Failed to load</div>;
  if (!data) return <div>Loading...</div>;
  return (
    <TableContainer>
      <Table variant="simple">
        <Thead>
          <Tr>
            <Th isNumeric>Pick</Th>
            <Th>Player</Th>
          </Tr>
        </Thead>
        <Tbody>
          {assignAllPickDraftValues(data.picks)}
          {data.picks.map((pick: DraftPick) => {
            return (
              <Tr
                key={pick.draft_id + "_" + pick.player_id}
                className={
                  pick.picked_by == context ? "UserPick" : "NonUserPick"
                }
              >
                <Td isNumeric>{pick.pick_no}</Td>
                <Td>
                  {pick.metadata.first_name} {pick.metadata.last_name}
                </Td>
              </Tr>
            );
          })}
        </Tbody>
        <Tfoot />
      </Table>
    </TableContainer>
  );
};

function assignAllPickDraftValues(picks: DraftPick[]) {
  const combinedPicks = new Map<string, DraftPick[]>();
  picks.forEach((pick) => {
    if (!combinedPicks.has(pick.player_id)) {
      combinedPicks.set(pick.player_id, new Array(pick));
    } else {
      let pickArr = combinedPicks.get(pick.player_id);
      pickArr!.push(pick);
      combinedPicks.set(pick.player_id, pickArr!);
    }
  });
}

export default AllPicksTable;
