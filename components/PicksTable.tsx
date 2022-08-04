import { Table, TableContainer, Tbody, Td, Tfoot, Th, Thead, Tr } from "@chakra-ui/react";
import axios from "axios";
import React, { useContext } from "react";
import useSWR from "swr";
import { Context } from "../contexts/Context";
import { DraftPick } from "../interfaces/sleeper_api/DraftPick";

type MyProps = { draftId: string };

const fetcher = (url: string) => axios.get(url).then(res => res.data);
const PicksTable = (props: MyProps) => {
  const [context, setContext] = useContext(Context);
  const { data, error } = useSWR('https://api.sleeper.app/v1/draft/' + props.draftId + '/picks', fetcher)

  if (error) return <div>Failed to load</div>
  if (!data) return <div>Loading...</div>
  return (
      <TableContainer>
      <Table variant='simple'>
        <Thead>
          <Tr>
            <Th isNumeric>Pick</Th>
            <Th>Player</Th>
          </Tr>
        </Thead>
        <Tbody>
        {data.map((pick: DraftPick) => {
            return <Tr key={pick.player_id} className={(pick.picked_by == context) ? 'UserPick' : 'NonUserPick'}>
                  <Td isNumeric>{pick.pick_no}</Td>
                  <Td>{pick.metadata.first_name} {pick.metadata.last_name}</Td>
            </Tr>})}
        </Tbody>
        <Tfoot/>
      </Table>
    </TableContainer>
  );
}

export default PicksTable;