import { background, Box, Stack } from "@chakra-ui/react";
import { useContext } from "react";
import League from "../../classes/custom/League";
import { TradedPick } from "../../classes/sleeper/DraftPick";
import {
  Adds,
  SleeperTransaction,
} from "../../classes/sleeper/SleeperTransaction";
import { Context } from "../../contexts/Context";
import TradeSide from "../groups/transactions/TradeSide";
import Card from "./Card";

interface MyProps {
  trade: SleeperTransaction;
}

export default function TradeCard(props: MyProps) {
  const [context, setContext] = useContext(Context);

  //Gotta reverse the order of the roster add/drops and make them easily accessable
  const rosterPlayerAdds = new Map<number, (number | string)[]>();
  const rosterPlayerDrops = new Map<number, (number | string)[]>();

  const draftPickAdds = new Map<number, TradedPick[]>();
  const draftPickDrops = new Map<number, TradedPick[]>();

  const faabLedger = new Map<number, number>();

  if (props.trade.adds) {
    for (const [key, value] of Object.entries(props.trade.adds)) {
      if (rosterPlayerAdds.has(value as any)) {
        rosterPlayerAdds.get(value as any)?.push(key);
      } else {
        rosterPlayerAdds.set(value as any, [key]);
      }
    }
  }

  if (props.trade.drops) {
    for (const [key, value] of Object.entries(props.trade.drops)) {
      if (rosterPlayerDrops.has(value as any)) {
        rosterPlayerDrops.get(value as any)?.push(key);
      } else {
        rosterPlayerDrops.set(value as any, [key]);
      }
    }
  }

  props.trade.draft_picks.forEach((pick) => {
    if (draftPickAdds.has(pick.owner_id)) {
      draftPickAdds.get(pick.owner_id)?.push(pick);
    } else {
      draftPickAdds.set(pick.owner_id, [pick]);
    }

    if (draftPickDrops.has(pick.previous_owner_id)) {
      draftPickDrops.get(pick.previous_owner_id)?.push(pick);
    } else {
      draftPickDrops.set(pick.previous_owner_id, [pick]);
    }
  });

  props.trade.waiver_budget.forEach((faabTransaction) => {
    if (faabLedger.has(faabTransaction.sender)) {
      let senderBalance = faabLedger.get(faabTransaction.sender);
      faabLedger.set(
        faabTransaction.sender,
        (senderBalance as number) - faabTransaction.amount
      );
    } else {
      faabLedger.set(faabTransaction.sender, faabTransaction.amount * -1);
    }

    if (faabLedger.has(faabTransaction.receiver)) {
      let receiverBalance = faabLedger.get(faabTransaction.receiver);
      faabLedger.set(
        faabTransaction.receiver,
        (receiverBalance as number) + faabTransaction.amount
      );
    } else {
      faabLedger.set(faabTransaction.receiver, faabTransaction.amount);
    }
  });

  if (context.playerDetails == null || context.playerDetailsundefined)
    return <Box>Loading</Box>;

  return (
    <Stack width={"-moz-fit-content"} maxW={["container.sm","container.md","container.xl"]} borderColor={"surface.0"} direction={["column", "row"]} shadow={"lg"} spacing={8}  borderWidth="thin" borderStyle={"solid"} borderRadius={4} p={6} my={2} _hover={{
        shadow: "2xl",
        transitionDuration: ".5s"
      }}>
      {props.trade.consenter_ids.map((id: number) => {
        return (
          <TradeSide
            key={id}
            rosterId={0}
            ownerName={context.members.get(id).name}
            playerAdds={
              rosterPlayerAdds.get(id)?.map((playerId) => {
                return context.playerDetails.get(playerId.toString());
              }) as any
            }
            playerDrops={
              rosterPlayerDrops.get(id)?.map((playerId) => {
                return context.playerDetails.get(playerId.toString());
              }) as any
            }
            draftPickAdds={draftPickAdds.get(id)}
            draftPickDrops={draftPickDrops.get(id)}
            faab={faabLedger.get(id)}
          />
        );
      })}
    </Stack>
  );
}

function getAdds(owner_id: number, adds: Adds) {}
