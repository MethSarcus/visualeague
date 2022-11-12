import {
  Avatar, Button
} from "@chakra-ui/react";
import Link from "next/link";
import LeagueMember from "../../classes/custom/LeagueMember";

type MyProps = {
  leagueId: string
  member: LeagueMember;
};

const LeagueMemberButton = (props: MyProps) => {
  return (
    <Link href={`league/${props.leagueId}/${props.member.roster.roster_id}`}>
      <Button size={"xl"} p={3} colorScheme="primary" leftIcon={<Avatar
        src={`https://sleepercdn.com/avatars/thumbs/${props.member.avatar}`}
        size="md"
        name={props.member.name}
      />}>
          {`${props.member.name} (${props.member.stats.wins}-${props.member.stats.losses})`}
      </Button>
      </Link>
  );
};

export default LeagueMemberButton;
