import {
  Avatar, Button, Box
} from "@chakra-ui/react";
import Link from "next/link";
import LeagueMember from "../../classes/custom/LeagueMember";

type MyProps = {
  leagueId: string
  member: LeagueMember;
};

const LeagueMemberButton = (props: MyProps) => {
  return (
    <Box my={1}>
    <Link href={`league/${props.leagueId}/team/${props.member.roster.roster_id}`}>
      <Button size={"sm"} p={3} colorScheme="secondary" leftIcon={<Avatar
        src={`https://sleepercdn.com/avatars/thumbs/${props.member.avatar}`}
        size="xs"
        name={props.member.name}
      />}>
          {`${props.member.name} (${props.member.stats.wins}-${props.member.stats.losses})`}
      </Button>
      </Link>
      </Box>
  );
};

export default LeagueMemberButton;
