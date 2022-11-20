"use client"
import { Grid, GridItem } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import { useContext } from "react";
import TeamCard from "../../../../../components/cards/TeamCard";
import { Context } from "../../../../../contexts/Context";

export default function TeamPage() {
    const [context, setContext] = useContext(Context)
    const memberId = usePathname()?.split("/")[-1];
    return (
    <Grid
        gap={4}
        mx={4}
        my={2}
        templateAreas={`"TeamSum TeamSum TeamSum"
                          "pfTable pfTable pfTable"
                          "pfChart pfChart pfChart"`}
        gridTemplateColumns={"1fr 1fr 1fr"}
      >
        <GridItem area={"TeamSum"}>
            {context?.members != undefined && <TeamCard member={context?.members.get(memberId)} variant={""} size={"md"}/>}
        </GridItem>
        
      </Grid>)
}