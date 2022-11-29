import { Flex, Avatar, Spacer, Box, Text } from "@chakra-ui/react";

interface MyProps {
  username: string;
  teamName: string;
  score: string;
  projectedScore: number;
  inverted?: boolean;
  avatarId: string;
  isWinner: boolean
  ringColor: string
}

export default function MatchupHeader(props: MyProps) {
  return (
    <Flex
      p={5}
      borderRadius="15px"
      border={"solid"}
      borderWidth={"thin"}
      borderColor={"rgb(56,62,80)"}
      maxW={"sm"}
      bg={"rgb(49,56,72)"}
    >
      <Avatar
        ring={1}
        ringColor={props.ringColor}
        src={`https://sleepercdn.com/avatars/${props.avatarId}`}
      />
      <Box pl={2} alignItems={props.inverted ? "start" : "end"}>
        <Text fontWeight={"light"} color={"textTheme.mediumEmphasis"}>
          {props.username}
        </Text>
        <Text fontWeight={"semibold"} color={"textTheme.highEmphasis"}>
          {props.teamName}
        </Text>
      </Box>
      <Spacer />
      <Text
        mt="auto"
        mb="auto"
        fontWeight={"semibold"}
        color={"textTheme.highEmphasis"}
        mr={2}
      >
        {props.score}
      </Text>
    </Flex>
  );
}
