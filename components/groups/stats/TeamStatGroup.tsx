"use client"
import { Flex, HStack, SimpleGrid, Spacer } from "@chakra-ui/react";
import League from "../../../classes/custom/League";
import { OrdinalStatInfo } from "../../../classes/custom/OrdinalStatInfo";
import GenericStatCard from "../../cards/statcards/GenericStatCard";
import TeamStatCard from "../../cards/statcards/TeamStatCard";

interface MyProps {
    league?: League
    memberId: number
}

export default function TeamStatGroup(props: MyProps) {
    let pfStats: OrdinalStatInfo[];
    let powerRankStats: OrdinalStatInfo[];
    let gpStats: OrdinalStatInfo[];
    let memberPfStats: OrdinalStatInfo | null = null
    let memberPowerRankStats: OrdinalStatInfo | null = null

    if (props.league?.settings != undefined) {
        pfStats = props.league?.getPfOrdinalStats?.()
        gpStats = props.league?.getGpOrdinalStats?.()
        powerRankStats = props.league?.getPowerRankOrdinalStats?.()
        memberPfStats = getMemberStats(pfStats!, props.memberId) as unknown as OrdinalStatInfo
        memberPowerRankStats = getMemberStats(powerRankStats!, props.memberId) as unknown as OrdinalStatInfo
    }
    
    return (
        <SimpleGrid columns={3} spacing={3}>
        <TeamStatCard
          statName={"Power Rank"}
          isLoaded = {props.league?.settings != undefined}
          statValue={memberPowerRankStats?.placement}
          statOwner={`${memberPowerRankStats?.stat}%`}
          isGoodThing={memberPowerRankStats?.isAboveAverage} />
        <TeamStatCard
          statName={"PF"}
          isLoaded = {props.league?.settings != undefined}
          statValue={memberPfStats?.placement}
          statOwner={memberPfStats?.stat}
          isGoodThing={memberPfStats?.isAboveAverage} />
      <TeamStatCard
      isLoaded = {props.league?.settings != undefined}
        statName={"Points Against"}
    
        statOwner={props.league?.getGpOrdinalStats?.().at(0)?.name}
        statValue={props.league?.getGpOrdinalStats?.().at(0)?.stat}
        isGoodThing={true}
      
      />

      <TeamStatCard
        statName={"Potential Points"}
        isLoaded = {props.league?.settings != undefined}
        
        statOwner={props.league?.getPfOrdinalStats?.().at(-1)?.name}
        statValue={props.league?.getPfOrdinalStats?.().at(-1)?.stat}
        isGoodThing={false}
        
      />

      <TeamStatCard
        isLoaded = {props.league?.settings != undefined}
        statName={"OPSLAP"}
        
        statOwner={props.league?.getGpOrdinalStats?.().at(-1)?.name}
        statValue={props.league?.getGpOrdinalStats?.().at(-1)?.stat}
        isGoodThing={false}
        
      />
            <TeamStatCard
        isLoaded = {props.league?.settings != undefined}
        statName={"Gut Points"}
        statOwner={props.league?.getGpOrdinalStats?.().at(-1)?.name}
        statValue={props.league?.getGpOrdinalStats?.().at(-1)?.stat}
        isGoodThing={false}
        
      />
      </SimpleGrid>
    )

}

function getMemberStats(stats: OrdinalStatInfo[], memberId: number) {
    let memberStat;
    stats.forEach(stat => {
        if (stat.rosterId == memberId) {
            memberStat = stat
        }
    })

    return memberStat

}