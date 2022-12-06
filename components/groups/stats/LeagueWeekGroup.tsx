import { Card, HStack } from "@chakra-ui/react";
import League from "../../../classes/custom/League";
import WeekStatCard from "../../cards/statcards/WeekStatCard";


interface MyProps {
    league: League | undefined
}
export default function LeagueNotableWeeksStatGroup(props: MyProps) {

    let notablePlayers

    if (props.league?.settings) {
        notablePlayers = props.league.getLeagueNotableWeeks()
        console.log(notablePlayers)
    }

    return (<HStack>
        nfd
    </HStack>)
}