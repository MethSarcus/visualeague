"use client";
import {
  Avatar,
  Box,
  Button,
  Center,
  Flex,
  Modal,
  ModalOverlay,
  Spacer,
  Text,
  useDisclosure,
} from "@chakra-ui/react";
import { useContext } from "react";
import LeagueMember from "../../../classes/custom/LeagueMember";
import Matchup from "../../../classes/custom/Matchup";
import { MatchupSide } from "../../../classes/custom/MatchupSide";
import { Context } from "../../../contexts/Context";
import MatchupModalBody from "../../MatchupModalBody";

type MyProps = {
  matchupSide: MatchupSide | undefined;
  memberId: number | undefined;
  mainStat: String | undefined;
  subStat?: String | undefined;
  matchup?: Matchup | undefined;
  title: String | undefined;
  isLoaded: boolean;
};

const WeekStatCard = (props: MyProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [context, setContext] = useContext(Context);

  let leagueMember;

  if (context?.settings != undefined) {
    leagueMember = context?.members?.get(props.memberId) as LeagueMember;
  }
  return (
    <Flex
    flexDir={"column"}
      border={"1px"}
      borderRadius={4}
      boxShadow={"2xl"}
      minWidth={["150px", "200px"]}
      minHeight={["125px", "200px"]}
      py={2}
      px={5}
      bg={"surface.0"}
      dropShadow="2xl"
    >
      <Spacer/>
      <Box textAlign={"center"} alignItems={"middle"}>
        <Box fontWeight="normal" fontSize={"1em"} color={"white"}>
          {props.title}
        </Box>
        <Text
          fontWeight={"bold"}
          fontSize={"1.2em"}
          color={"textTheme.highEmphasis"}
        >
          {props.mainStat}
        </Text>

        <Avatar
          mt={2}
          size={"md"}
          src={`https://sleepercdn.com/avatars/thumbs/${leagueMember?.avatar}`}
        />
        <Text
          fontSize={"1em"}
          fontWeight="medium"
          color={"textTheme.highEmphasis"}
        >
          {props.subStat}
        </Text>

        <Button
          visibility={props.matchup != undefined ? "visible" : "hidden"}
          mt={2}
          variant={"ghost"}
          colorScheme={"secondary"}
          onClick={onOpen}
          size={"xs"}
        >
          View
        </Button>
        <Modal size={"sm"} isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <MatchupModalBody matchup={props.matchup} onClose={onClose} />
        </Modal>
      </Box>
      <Spacer/>
    </Flex>
  );
};

export default WeekStatCard;
