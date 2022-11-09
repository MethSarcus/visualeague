import {
  Box,
  Wrap,
  Heading,
  SimpleGrid,
  Container,
  Grid,
  GridItem,
} from "@chakra-ui/react";
import axios from "axios";
import router, { useRouter } from "next/router";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import League from "../../classes/custom/League";
import { SleeperTransaction } from "../../classes/sleeper/SleeperTransaction";
import { Context } from "../../contexts/Context";
import TradeCard from "../cards/TradeCard";
import TradeChordChart from "../charts/TradeChordChart";

export default function TradePageContent() {
  const fetcher = (url: string) => axios.get(url).then((res) => res.data);
  const context = useContext(Context);
  const router = useRouter();
  const leagueId = router.query.league;
  const [trades, setTrades] = useState([]);
  const { data: tradeData, error: tradeError } = useSWR(
    leagueId != undefined ? `/api/trades/${router.query.league}` : null,
    fetcher
  );

  useEffect(() => {
    if (tradeData && tradeData.trades) {
      setTrades(tradeData.trades);
    }
  }, [tradeData, setTrades, trades]);

  if (tradeError) return <Heading color={"white"}>Failed to load</Heading>;
  if (!tradeData) return <Heading color={"white"}>Loading...</Heading>;

  return (
    <Container maxW={"container.xl"} maxH={"80vh"} overflowY={"scroll"} p={[0, "auto"]} m={[0, "auto"]}>
      <Grid
        templateRows="repeat(12, 1fr)"
        templateColumns="repeat(12, 1fr)"
        gap={4}
      >
          <GridItem rowSpan={4} color={"black"} colSpan={6}>
            <TradeChordChart trades={trades} />
          </GridItem>
          <GridItem textColor={"white"} colSpan={6} rowSpan={4}>
          {trades.map((trade: SleeperTransaction) => {
            return <TradeCard key={trade.transaction_id} trade={trade} />;
          })}
          </GridItem>
      </Grid>
    </Container>
  );
}
