import { Avatar, AvatarBadge, Tooltip } from "@chakra-ui/react";
import LeagueMember from "../../classes/custom/LeagueMember";
import { OrdinalStatInfo } from "../../classes/custom/OrdinalStatInfo";

interface MyProps {
    avatarStats: OrdinalStatInfo
}

const NumericalAvatar = (props: MyProps) => {

    return(
    <Tooltip label={props.avatarStats.stat}>
    <Avatar size={'md'} name={props.avatarStats.name}  src={`https://sleepercdn.com/avatars/thumbs/${props.avatarStats.avatar}`}>
    <AvatarBadge color={'white'} boxSize='1.5em' height='7' width='7' fontSize='.4em' background={"black"} >{props.avatarStats.placement}</AvatarBadge>
  </Avatar>
  </Tooltip>)
}

export default NumericalAvatar