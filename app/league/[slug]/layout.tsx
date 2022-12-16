"use client";
import { Grid, GridItem, Heading } from "@chakra-ui/react";
import axios from "axios";
import { enableAllPlugins } from "immer";
import { usePathname } from "next/navigation";
import { useContext, useEffect, useState } from "react";
import useSWR from "swr";
import League from "../../../classes/custom/League";
import SleeperLeague from "../../../classes/sleeper/SleeperLeague";
import { SleeperMatchup } from "../../../classes/sleeper/SleeperMatchup";
import Footer from "../../../components/Footer";
import Navbar from "../../../components/nav/Navbar";
import { Context } from "../../../contexts/Context";
import styles from "../../../styles/Home.module.css";
import { getAllPlayersString } from "../../../utility/rosterFunctions";
export default function LeagueLayout({
  children, // will be a page or nested layout
}: {
  children: React.ReactNode;
}) {
  enableAllPlugins()
  const [context, setContext] = useContext(Context);
  let leagueId = usePathname()?.replace("/league/", "");
  if (leagueId?.includes("/trades")) {
    leagueId = leagueId.replace("/trades", "");
  }

  if (leagueId?.includes("/ranks")) {
    leagueId = leagueId.replace("/ranks", "");
  }

  if (leagueId?.includes("/team")) {
    leagueId = leagueId.split("/team")[0];
  }

  const fetcher = (url: string) => axios.get(url).then((res) => res.data);

  function arrayFetcher(...urlArr: any[]) {
    const f = (u: RequestInfo | URL) => fetch(u).then((r) => r.json());
    return Promise.all(urlArr.map(f));
  }
  
  const { data: leagueDetails, error: leagueDetailsError } = useSWR(
    leagueId ? `https://api.sleeper.app/v1/league/${leagueId}` : null,
    fetcher
  );

  const { data: leagueUsers, error: leagueUsersError } = useSWR(
    leagueId ? `https://api.sleeper.app/v1/league/${leagueId}/users` : null,
    fetcher
  );

  const { data: leagueRosters, error: leagueRostersError } = useSWR(
    leagueId ? `https://api.sleeper.app/v1/league/${leagueId}/rosters` : null,
    fetcher
  );

  const { data: leagueMatchups, error: leagueMatchupsError } = useSWR(
    leagueDetails ? `/api/matchups/${leagueId}/${leagueDetails?.settings?.last_scored_leg}` : null,
    fetcher
  );
  
  const { data: playerDetails, error: detailsError } = useSWR(leagueMatchups ? '/api/details' + getAllPlayersString(leagueMatchups.matchups) : null, fetcher)
  
  const { data: playerStats, error: statsError } = useSWR(leagueMatchups ? getLeagueStatsArray(leagueMatchups.matchups, getAllPlayersString(leagueMatchups.matchups)) : null, arrayFetcher)
  const { data: playerProjections, error: projectionsError } = useSWR(leagueMatchups ? getLeagueProjectionsArray(leagueMatchups.matchups, getAllPlayersString(leagueMatchups.matchups)) : null, arrayFetcher)
  // const { data: leagueData, error: leagueError } = useSWR(
  //   leagueId ? `/api/league/${leagueId}` : null,
  //   fetcher
  // );
  const { data: tradeData, error: tradeError } = useSWR(
    leagueId ? `/api/trades/${leagueId}` : null,
    fetcher
  );

  function getLeagueStatsArray(matchups: SleeperMatchup[][], playersString: string) {
    let matchupStatsUrls: string[] = []
    matchups.forEach((week, index) => {
      matchupStatsUrls.push(`/api/stats/${index + 1}/${playersString}`)
    })

    return matchupStatsUrls
  }

  function getLeagueProjectionsArray(matchups: SleeperMatchup[][], playersString: string) {
    let matchupProjectionsUrls: string[] = []
    matchups.forEach((week, index) => {
      matchupProjectionsUrls.push(`/api/projections/${index + 1}/${playersString}`)
    })

    return matchupProjectionsUrls
  }




  useEffect(() => {
    if (tradeData?.trades && playerStats && playerProjections && leagueMatchups && leagueRosters && playerDetails?.details) {
      let sleepLeague = new SleeperLeague(leagueUsers, leagueDetails, leagueMatchups, leagueRosters, playerStats, playerProjections, playerDetails.details)
      console.log(sleepLeague)
      let league = new League(sleepLeague);
      console.log(tradeData)
      league.addTrades(tradeData?.trades)
      console.log(league);
      setContext(league);
    }
  }, [setContext, tradeData, playerDetails, leagueDetails, leagueMatchups, playerStats, playerProjections, leagueUsers, leagueRosters]);

  if (projectionsError || tradeError || statsError || leagueRostersError) return <Heading color={"white"}>Failed to load</Heading>;
  return (
    <section>
      <main className={styles.main}>
        <div className="App">
          <Grid
            gap={0}
            h={"100vh"}
            gridTemplateRows={"0fr 1fr 0fr"}
            templateAreas={`"header header"
                    "main main"
                    "footer footer"`}
            color="surface.0"
            fontWeight="bold"
          >
            <GridItem area={"header"} >
              <Navbar leagueID={leagueId} />
            </GridItem>

            <GridItem area={"main"} p={[0, 0, 4]} overflowY={"auto"}>
              {children}
            </GridItem>

            <GridItem bg="surface.0" mt={"auto"} area={"footer"}>
              <Footer />
            </GridItem>
          </Grid>

        </div>
      </main>
    </section>
  );
}
