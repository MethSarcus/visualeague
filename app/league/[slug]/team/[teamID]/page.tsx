"use client"
import { Grid, GridItem } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import GenericStatCard from "../../../../../components/cards/statcards/GenericStatCard";
import TeamCard from "../../../../../components/cards/TeamCard";
import HomeStatGroup from "../../../../../components/groups/stats/HomeStatGroup";
import TeamStatGroup from "../../../../../components/groups/stats/TeamStatGroup";
import { Context } from "../../../../../contexts/Context";

export default function TeamPage() {
    const [context, setContext] = useContext(Context)
    const memberId = usePathname()?.slice(-1) ;

    return (
    <Grid
        gap={4}
        mx={4}
        my={2}
        templateAreas={`"TeamSum TeamSum TeamSum"
                          "stats stats stats"
                          "pfChart pfChart pfChart"`}
        gridTemplateColumns={"1fr 1fr 1fr"}
      >
        <GridItem area={"TeamSum"} mt={3}>
            {context?.members != undefined && <TeamCard member={context?.members.get(parseInt(memberId!))} league={context} variant={""} size={"md"}/>}
        </GridItem>
        <GridItem area={"stats"}>
          <TeamStatGroup league={context} memberId={parseInt(memberId!)}/>
        </GridItem>
        <GridItem>
          Team MVP Stats
        </GridItem>
        
      </Grid>)
}