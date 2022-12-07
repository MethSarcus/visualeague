import { Box, Button, Center, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, Text } from "@chakra-ui/react";
import { useContext } from "react";
import League from "../classes/custom/League";
import Matchup from "../classes/custom/Matchup";
import { Context } from "../contexts/Context";
import { project_colors } from "../utility/project_colors";
import { LINEUP_POSITION } from "../utility/rosterFunctions";
import MatchupHeader from "./sleeper/MatchupHeader";
import PositionalMatchupContainer from "./sleeper/PositionalMatchupContainer";

interface MyProps {
    matchup: Matchup | undefined
    onClose: any
}

export default function MatchupModalBody(props: MyProps) {
    const [context, setContext] = useContext(Context)
    return (

      <ModalContent bg={"#1A202E"} color={"white"} overflowX={"hidden"}>
        <ModalHeader>
          <Center>
            <MatchupHeader matchup={props.matchup!} />
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
                    homePlayer={props.matchup?.homeTeam.starters.at(index)!}
                    awayPlayer={props.matchup?.awayTeam?.starters.at(index)!}
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
                      homePlayer={props.matchup?.homeTeam.bench.at(index)!}
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
      