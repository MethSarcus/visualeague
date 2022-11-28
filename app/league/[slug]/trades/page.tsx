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
    const desktopTemplate = `
    "chart chart trades trades"
    "chart chart trades trades"
    "chart chart trades trades"
    "chart chart trades trades"`

    const mobileTemplate = `
    "chart chart chart chart"
    "trades trades trades trades"`
  
    if (context.transactions == undefined) return <Heading color={"white"}>Loading</Heading>;
  
    return (
      <Container maxW={"container.xl"} p={[0, "auto"]} m={[0, "auto"]}>
        <Grid
          templateAreas={[mobileTemplate, desktopTemplate]}
          gap={2}
        >
      <GridItem height={"500px"} area={'chart'} p={3}>
        <TradeChordChart trades={context.transactions} />
      </GridItem>
      <GridItem  area="trades" >
      <Container textColor={"white"} maxH={"50vh"} overflowY={"scroll"} color='white'>
      {context.transactions.map((trade: SleeperTransaction) => {
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
  