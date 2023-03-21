import { Avatar, Box, Button, Center } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { useState } from "react";
import LeagueMember from "../classes/custom/LeagueMember";
import { SleeperUser } from "../classes/sleeper/SleeperUser";
import { project_colors } from "../utility/project_colors";

type MyProps = {
  user: LeagueMember
  setFocusFunction: (rosterID: number) => {}
  focusedRosterId: number
};

const LeagueMemberDraftCard = (props: MyProps) => {
  const [active, setActive] = useState(false)

  function handleStateChange() {
    setActive(!active)
    props.setFocusFunction(props.user.roster.roster_id)
  }


  return (
    <Center textColor={project_colors.textTheme.highEmphasis} transition={'all .2s ease'} background={(active && props.user.roster.roster_id == props.focusedRosterId) ? "surface.6" : "surface.0"} _hover={{cursor: "pointer", background: "surface.6", outlineColor: project_colors.textTheme.mediumEmphasis, outline: "solid", outlineWidth: "2px", outlineStyle: "inset"}} textOverflow={"ellipsis"} borderRadius="6" p={3} px={3} py={4} width={"180px"} mt={1} onClick={() => handleStateChange()}>
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


