"use client"
import {
  Container,
  Grid,
  GridItem,
  Heading
} from "@chakra-ui/react";
import axios from "axios";
import type { NextPage } from "next";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import { SleeperTransaction } from "../../../../classes/sleeper/SleeperTransaction";
import TradeCard from "../../../../components/cards/TradeCard";
import TradeChordChart from "../../../../components/charts/TradeChordChart";
import { Context } from "../../../../contexts/Context";
  
  export default function Page() {
    const [context, setContext] = useContext(Context)
    const fetcher = (url: string) => axios.get(url).then((res) => res.data);
    const leagueId = usePathname()?.replace("/league/","").replace("/trades", "");
    console.log(leagueId)
  
    const [trades, setTrades] = useState([]);
    const { data: tradeData, error: tradeError } = useSWR(
      leagueId != undefined ? `/api/trades/${leagueId}` : null,
      fetcher
    );
  
    useEffect(() => {
      if (tradeData && tradeData.trades && context.settings != undefined) {
        setTrades(tradeData.trades);
      }
    }, [context, tradeData, setTrades, trades]);
  
    if (tradeError) return <Heading color={"white"}>Failed to load</Heading>;
    if (!tradeData) return <Heading color={"white"}>Loading...</Heading>;
  
    return (
      <Container maxW={"container.xl"} p={[0, "auto"]} m={[0, "auto"]}>
        <Grid
          templateRows="repeat(6, 1fr)"
          templateColumns="repeat(4, 1fr)"
          templateAreas={`
          "chart chart trades trades"
          "chart chart trades trades"
          "chart chart trades trades"
          "chart chart trades trades"`}
          gap={2}
        >
      <GridItem height={"500px"} area={'chart'}>
        <TradeChordChart trades={trades} />
      </GridItem>
      <GridItem  area="trades" >
      <Container textColor={"white"} maxH={"50vh"} overflowY={"scroll"} color='white'>
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
  };
  