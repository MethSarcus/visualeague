import {
  Avatar, Button
} from "@chakra-ui/react";
import LeagueMember from "../../classes/custom/LeagueMember";

type MyProps = {
  member: LeagueMember;
};

const LeagueMemberButton = (props: MyProps) => {
  return (
      <Button size={"xl"} p={3} colorScheme="primary" leftIcon={<Avatar
        src={`https://sleepercdn.com/avatars/thumbs/${props.member.avatar}`}
        size="md"
        name={props.member.name}
      />}>
          {`${props.member.name} (${props.member.stats.wins}-${props.member.stats.losses})`}
      </Button>
  );
};

export default LeagueMemberButton;
