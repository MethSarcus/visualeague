import { Avatar, Box, Center, Heading, HStack, Icon, Text } from "@chakra-ui/react";
import { SleeperPlayerDetails } from "../../../classes/custom/Player";
import { FaPlus, FaMinus } from "react-icons/fa";

interface MyProps {
  player: SleeperPlayerDetails;
  added: boolean;
}

export default function PlayerTransaction(props: MyProps) {
  let addDropIcon;
  let iconColor;
  if (props.added) {
    addDropIcon = FaPlus;
    iconColor = "green";
  } else if (props.added == false) {
    addDropIcon = FaMinus;
    iconColor = "red";
  }

  const name = `${props.player.first_name} ${props.player.last_name}`

  const position = `${props.player.position} - ${props.player.team}`

  return (
    <HStack>
      {<Icon h={3} color={iconColor} as={addDropIcon} />}
      <Avatar
        name={name}
        size={"sm"}
        backgroundColor="rgb(239, 239, 239)"
        src={isNaN(+props.player?.player_id!) ? `https://sleepercdn.com/images/team_logos/nfl/${props.player.player_id.toLowerCase()}.png` : `https://sleepercdn.com/content/nfl/players/${props.player?.player_id}.jpg`}

      />
      <Box>
        <Heading fontSize="xs">{name}</Heading>
        <Text fontSize={"xs"} fontWeight={"light"}>{position}</Text>
      </Box>
    </HStack>
  );
}
