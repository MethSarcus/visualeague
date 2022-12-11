"use client"
import {
  Avatar,
  AvatarBadge,
  Box,
  Button,
  Card,
  CardHeader,
  Center,
  Flex,
  HStack,
  Modal,
  ModalOverlay,
  Skeleton,
  SkeletonCircle,
  SkeletonText,
  Spacer,
  Text,
  Tooltip,
  useDisclosure,
} from "@chakra-ui/react";
import { useContext } from "react";
import Matchup from "../../../classes/custom/Matchup";
import { Context } from "../../../contexts/Context";
import { project_colors } from "../../../utility/project_colors";
import MatchupModalBody from "../../MatchupModalBody";

type MyProps = {
  matchup: Matchup | undefined;
  memberId?: number | undefined;
  title: String | undefined;
  mainStat: String | undefined;
  subStat?: String | undefined;
  subSubStat?: String | undefined;
  isLoaded: boolean
};

const NotableMatchupStatCard = (props: MyProps) => {
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [context, setContext] = useContext(Context);
  let homeMember;
  let awayMember;
  let awayBadgeColor;
  let homeBadgeColor;
  if (context?.settings != undefined) {
    homeMember = context.members.get(props.matchup?.homeTeam.roster_id);
    awayMember = context.members.get(props.matchup?.awayTeam?.roster_id);
  }
  let homeColor = project_colors.statColor.neutral;
  let awayColor = project_colors.statColor.neutral;

  if (props.matchup?.homeTeam.roster_id == props.matchup?.winnerRosterId) {
    homeColor = project_colors.statColor.good;
    homeBadgeColor = "green.500";
    awayColor = project_colors.statColor.bad;
    awayBadgeColor = "tomato";
  } else if (
    props.matchup?.homeTeam.roster_id != props.matchup?.winnerRosterId
  ) {
    homeColor = project_colors.statColor.bad;
    awayColor = project_colors.statColor.good;
    homeBadgeColor = "tomato";
    awayBadgeColor = "green.500";
  }
  return (
    <>
      <Flex
        flexDirection={"column"}
        py={3}
        px={3}
        dropShadow="2xl"
        textAlign={"center"}
        borderColor={project_colors.sleeper.border_color}
        border={"1px"}
        borderRadius={4}
        bg={"surface.0"}
        boxShadow={"2xl"}
        minWidth={"150px"}
        minHeight={"150px"}
      >
        <Text
          p={2}
          fontWeight="bold"
          fontSize={"1em"}
          color={"textTheme.highEmphasis"}
          mb={0}
        >
          {props.title}
        </Text>

        <Spacer />

        <Text
          fontSize={".8em"}
          fontWeight="normal"
          mx={7}
          my={1}
          color={"textTheme.mediumEmphasis"}
        >
          Week {props.matchup?.weekNumber}
        </Text>
        <Center mt={2}>
          <Tooltip label={homeMember?.teamName}>

            
            <Avatar
              borderColor={homeColor}
              borderWidth={2}
              size={"md"}
              src={`https://sleepercdn.com/avatars/thumbs/${homeMember?.avatar}`}
            >
              <AvatarBadge
                fontWeight={"bold"}
                p={0.5}
                borderWidth={2}
                borderColor={"surface.0"}
                fontSize={".45em"}
                bg={homeBadgeColor}
              >
                {props.matchup?.homeTeam.pf.toFixed(2)}
              </AvatarBadge>
            </Avatar>
          </Tooltip>
          <Text
            color={project_colors.sleeper.text_normal}
            fontSize={".8em"}
            mx={2}
          >
            VS
          </Text>
          <Tooltip label={awayMember?.teamName}>
            <Avatar
              borderColor={awayColor}
              borderWidth={2}
              size={"md"}
              src={`https://sleepercdn.com/avatars/thumbs/${awayMember?.avatar}`}
            >
              <AvatarBadge
                fontWeight={"bold"}
                p={0.5}
                borderWidth={2}
                borderColor={"surface.0"}
                fontSize={".45em"}
                bg={awayBadgeColor}
              >
                {props.matchup?.awayTeam?.pf.toFixed(2)}
              </AvatarBadge>
            </Avatar>
          </Tooltip>
        </Center>

        <Text fontSize={".8em"} mt={2} color={"textTheme.highEmphasis"}>
          {props.mainStat}
        </Text>
        <Text fontSize={".7em"} color={"textTheme.highEmphasis"}>
        {props.subSubStat}
        </Text>
        <Spacer />
        <Button
          my={2}
          width={"50%"}
          margin={"0 auto"}
          onClick={onOpen}
          variant={"ghost"}
          colorScheme={"secondary"}
          size={"xs"}
        >
          View
        </Button>
      </Flex>

      <Modal size={"sm"} isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <MatchupModalBody matchup={props.matchup} onClose={onClose} />
      </Modal>
    </>
  );
};

export default NotableMatchupStatCard;
