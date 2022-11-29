"use client"
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
import { usePathname } from "next/navigation";
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
  const leagueId = usePathname()?.replace("/league/","").replace("/trades", "");
  const [trades, setTrades] = useState([]);
  const { data: tradeData, error: tradeError } = useSWR(
    leagueId != undefined ? `/api/trades/${leagueId}` : null,
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
    <Container maxW={"container.xl"} p={[0, "auto"]} m={[0, "auto"]}>
      <Grid
        templateRows="repeat(6, 1fr)"
        templateColumns="repeat(4, 1fr)"
        templateAreas={`"stats stats stats stats"
        "chart chart trades trades"
        "chart chart trades trades"
        "chart chart trades trades"
        "chart chart trades trades"`}
        gap={2}
      >
    <GridItem pl='2' bg='pink.300' area={'stats'}>
      Stats
    </GridItem>
    <GridItem height={"500px"} area={'chart'}>
      <TradeChordChart trades={trades} />
    </GridItem>
    <GridItem  area="trades" >
    <Container textColor={"white"} maxH={"50vh"} overflowY={"auto"} color='white'>
    {trades.map((trade: SleeperTransaction) => {
            return <TradeCard key={trade.transaction_id} trade={trade} />;
          })}
  </Container>

          </GridItem>
          {/* <GridItem color={"black"} area="chart">
            <TradeChordChart trades={trades} />
          </GridItem>
          <GridItem textColor={"white"} colSpan={2} rowSpan={1} area="trades">
          {trades.map((trade: SleeperTransaction) => {
            return <TradeCard key={trade.transaction_id} trade={trade} />;
          })}
          </GridItem> */}
      </Grid>
    </Container>
  );
}
