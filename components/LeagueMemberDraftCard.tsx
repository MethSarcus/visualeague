import { Avatar, Box, Button, Center } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import LeagueMember from "../classes/custom/LeagueMember";
import { SleeperUser } from "../classes/sleeper/SleeperUser";
import { project_colors } from "../utility/project_colors";

type MyProps = {
  user: LeagueMember
  setFocusFunction: (rosterID: number) => {}
};

const LeagueMemberDraftCard = (props: MyProps) => {
  const [active, setActive] = useState(false)

  return (
    <Center textColor={project_colors.textTheme.highEmphasis} transition={'all .2s ease'} _hover={{cursor: "pointer", background: "surface.6", outlineColor: "red", outline: "solid", outlineWidth: "1px", outlineStyle: "inset"}} textOverflow={"ellipsis"} borderRadius="6" bg={"surface.0"} p={3} px={3} py={4} width={"180px"} mt={1} onClick={() => props.setFocusFunction(props.user.roster.roster_id)}>
      <Avatar
        src={`https://sleepercdn.com/avatars/thumbs/${props.user.avatar}`}
        size="xs"
        name={props.user.name}
        ml={-1}
        mr={2}
      />
      <Box fontSize={"sm"} as="b" maxWidth={"160px"} noOfLines={1} textOverflow={"ellipsis"}>{props.user.name}</Box>
    </Center>
  );
};

export default LeagueMemberDraftCard;


