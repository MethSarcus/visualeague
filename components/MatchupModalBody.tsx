import { Box, Button, Center, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, Tab, TabList, TabPanel, TabPanels, Tabs, Text } from "@chakra-ui/react";
import { useContext, useState } from "react";
import League from "../classes/custom/League";
import Matchup from "../classes/custom/Matchup";
import { Context } from "../contexts/Context";
import { project_colors } from "../utility/project_colors";
import { LINEUP_POSITION } from "../utility/rosterFunctions";
import { LINEUP_OPTIONS } from "./sleeper/HorizontalPillSelector";
import MatchupHeader from "./sleeper/MatchupHeader";
import PositionalMatchupContainer from "./sleeper/PositionalMatchupContainer";

interface MyProps {
    matchup: Matchup | undefined
    onClose: any
}

export default function MatchupModalBody(props: MyProps) {
    const [context, setContext] = useContext(Context)
    const [homeStarters, setHomeStarters] = useState(props.matchup?.homeTeam.starters)
    const [homeBench, setHomeBench] = useState(props.matchup?.homeTeam.bench)
    const [homeScore, setHomeScore] = useState(props.matchup?.homeTeam.pf)
    const [homeProjectedScore, setHomeProjectedScore] = useState(props.matchup?.homeTeam.projectedScore)

    const [awayStarters, setAwayStarters] = useState(props.matchup?.awayTeam?.starters)
    const [awayBench, setAwayBench] = useState(props.matchup?.awayTeam?.bench)
    const [awayScore, setAwayScore] = useState(props.matchup?.awayTeam?.pf)
    const [awayProjectedScore, setAwayProjectedScore] = useState(props.matchup?.awayTeam?.projectedScore)

    function handleHomeTabChange(selected: string) {
      switch(selected) {
        case LINEUP_OPTIONS.ACTUAL: {
          setHomeStarters(props.matchup?.homeTeam.starters)
          setHomeBench(props.matchup?.homeTeam.starters)
          setHomeScore(props.matchup?.homeTeam.pf)
          setHomeProjectedScore(props.matchup?.homeTeam.projectedScore)
          break
        }
        case LINEUP_OPTIONS.MAX_PF: {
          let lineup = props.matchup?.homeTeam.getOptimalLineupAndBench()
          setHomeStarters(lineup?.starters)
          setHomeBench(lineup?.bench)
          setHomeScore(lineup?.score)
          setHomeProjectedScore(lineup?.projected_score)
          break
        }
        case LINEUP_OPTIONS.OPSLAP: {
          let lineup = props.matchup?.homeTeam.getOptimalProjectedLineupAndBench()
          setHomeStarters(lineup?.starters)
          setHomeBench(lineup?.bench)
          setHomeScore(lineup?.score)
          setHomeProjectedScore(lineup?.projected_score)
          break
        }
      }
    }

    function handleAwayTabChange(selected: string) {
      switch(selected) {
        case LINEUP_OPTIONS.ACTUAL: {
          setAwayStarters(props.matchup?.awayTeam?.starters)
          setAwayBench(props.matchup?.awayTeam?.starters)
          setAwayScore(props.matchup?.awayTeam?.pf)
          setAwayProjectedScore(props.matchup?.awayTeam?.projectedScore)
          break
        }
        case LINEUP_OPTIONS.MAX_PF: {
          let lineup = props.matchup?.awayTeam?.getOptimalLineupAndBench()
          setAwayStarters(lineup?.starters)
          setAwayBench(lineup?.bench)
          setAwayScore(lineup?.score)
          setAwayProjectedScore(lineup?.projected_score)
          break
        }
        case LINEUP_OPTIONS.OPSLAP: {
          let lineup = props.matchup?.awayTeam?.getOptimalProjectedLineupAndBench()
          setAwayStarters(lineup?.starters)
          setAwayBench(lineup?.bench)
          setAwayScore(lineup?.score)
          setAwayProjectedScore(lineup?.projected_score)
          break
        }
      }
    }

    return (

      <ModalContent bg={"#1A202E"} color={"white"} overflowX={"hidden"}>
        <ModalHeader>
          <Center>
            <MatchupHeader matchup={props.matchup!} homeLineupOnclick={handleHomeTabChange} awayLineupOnclick={handleAwayTabChange} homeAlteredScore={homeScore} homeAlteredProjectedScore={homeProjectedScore} awayAlteredScore={awayScore} awayAlteredProjectedScore={awayProjectedScore} />
          </Center>
          
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <Text
            fontWeight={"bold"}
            fontSize={"1.5em"}
            color={project_colors.sleeper.text_normal}
          >
            Starters
          </Text>

          {
            (context as League)?.settings?.roster_positions
              ?.filter((rosPos) => rosPos != "BN")
              .map((pos, index) => {
                return (
                  <PositionalMatchupContainer
                    key={index}
                    position={pos as LINEUP_POSITION}
                    homePlayer={homeStarters?.at(index)!}
                    awayPlayer={awayStarters?.at(index)!}
                  />
                );
              }) as any
          }

          <Box mt={8}>
            <Text
              fontWeight={"bold"}
              fontSize={"1.5em"}
              color={project_colors.sleeper.text_normal}
            >
              Bench
            </Text>
            {
              (context as League)?.settings.roster_positions
                ?.filter((rosPos) => rosPos == "BN")
                .map((pos, index) => {
                  return (
                    <PositionalMatchupContainer
                      key={index}
                      position={pos as LINEUP_POSITION}
                      homePlayer={homeBench?.at(index)!}
                      awayPlayer={props.matchup?.awayTeam?.bench.at(index)!}
                    />
                  );
                }) as any
            }
          </Box>
        </ModalBody>

        <ModalFooter>

          <Button
            variant="outline"
            colorScheme={"secondary"}
            onClick={props.onClose}
          >
            Close
          </Button>
        </ModalFooter>
      </ModalContent>
    )
}
      