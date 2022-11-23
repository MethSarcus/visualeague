"use client"
import { Flex, SimpleGrid, Spacer } from "@chakra-ui/react";
import League from "../../../classes/custom/League";
import { OrdinalStatInfo } from "../../../classes/custom/OrdinalStatInfo";
import GenericStatCard from "../../cards/statcards/GenericStatCard";

interface MyProps {
    league?: League

}

export default function HomeStatGroup(props: MyProps) {

    const pfStats = props.league?.getPfOrdinalStats?.()
    const gpStats = props.league?.getGpOrdinalStats?.()
    return (
        <SimpleGrid columns={2} spacing={3}>
        <GenericStatCard
          statName={"Best PF"}
          isLoaded = {props.league?.settings != undefined}
          statValue={props.league?.getPfOrdinalStats?.()[0].stat}
          statOwner={props.league?.getPfOrdinalStats?.()[0].name}
          isGoodThing={true} />



      <GenericStatCard
      isLoaded = {props.league?.settings != undefined}
        statName={"Best Manager"}
        statValue={props.league?.getGpOrdinalStats?.().at(0)?.stat}
        statOwner={props.league?.getGpOrdinalStats?.().at(0)?.name}
        isGoodThing={true}
      
      />

      <GenericStatCard
        statName={"Worst PF"}
        isLoaded = {props.league?.settings != undefined}
        statValue={props.league?.getPfOrdinalStats?.().at(-1)?.stat}
        statOwner={props.league?.getPfOrdinalStats?.().at(-1)?.name}
        isGoodThing={false}
        
      />

      <GenericStatCard
        isLoaded = {props.league?.settings != undefined}
        statName={"Worst Manager"}
        statValue={props.league?.getGpOrdinalStats?.().at(-1)?.stat}
        statOwner={props.league?.getGpOrdinalStats?.().at(-1)?.name}
        isGoodThing={false}
        
      />
      </SimpleGrid>
    )

}