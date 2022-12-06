"use client";
import {
  Avatar,
  Box,
  Center,
  Container,
  Flex,
  Text,
  SkeletonCircle,
  SkeletonText,
  Button,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  useDisclosure,
} from "@chakra-ui/react";
import { useContext } from "react";
import League from "../../../classes/custom/League";
import Matchup from "../../../classes/custom/Matchup";
import { MatchupSide } from "../../../classes/custom/MatchupSide";
import { SleeperPlayerDetails } from "../../../classes/custom/Player";
import SeasonPlayer from "../../../classes/custom/SeasonPlayer";
import { Week } from "../../../classes/custom/Week";
import { Context } from "../../../contexts/Context";
import { project_colors } from "../../../utility/project_colors";
import { LINEUP_POSITION } from "../../../utility/rosterFunctions";
import LineupPieChart from "../../charts/LineupPieChart";
import MatchupHeader from "../../sleeper/MatchupHeader";
import PositionalMatchupContainer from "../../sleeper/PositionalMatchupContainer";

type MyProps = {
  matchup: Matchup | undefined;
  memberId?: number | undefined;
  title: String | undefined;
  mainStat: String | undefined;
  subStat?: String | undefined;

  isLoaded: boolean;
};

const LeagueNotableWeekStatCard = (props: MyProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [context, setContext] = useContext(Context);
  return (
    <>
      <Box
        py={2}
        px={5}
        dropShadow="2xl"
        textAlign={"center"}
        border={"1px"}
        borderRadius={4}
        boxShadow={"2xl"}
        minWidth={"150px"}
        minHeight={"125px"}
      >
        <Box
          fontWeight="bold"
          fontSize={"1.2em"}
          color={"textTheme.highEmphasis"}
        >
          {props.title}
        </Box>
        <Text
          fontSize={".8em"}
          fontWeight="light"
          color={"textTheme.mediumEmphasis"}
        >
          {props.subStat}
        </Text>
        <Text
          fontSize={".9em"}
          fontWeight={"medium"}
          color={"textTheme.highEmphasis"}
        >
          {props.mainStat}
        </Text>
        <Button
          my={2}
          variant={"outline"}
          colorScheme={"secondary"}
          size={"xs"}
        >
          View
        </Button>
      </Box>

      <Modal size={"sm"} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
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
              (context as League).settings.roster_positions
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
                (context as League).settings.roster_positions
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
              onClick={onClose}
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LeagueNotableWeekStatCard;
