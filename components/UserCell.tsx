import { Avatar, Box, Button, Center } from "@chakra-ui/react";
import { useRouter } from "next/router";
import { SleeperUser } from "../classes/sleeper/SleeperUser";

type MyProps = {
  user: SleeperUser
};

const UserCell = (props: MyProps) => {
  const router = useRouter();

  return (
    <Center borderRadius="6" bg={"surface.1"} p={2} px={3}>
      <Avatar
        src={`https://sleepercdn.com/avatars/thumbs/${props.user.avatar}`}
        size="xs"
        name={props.user.display_name}
        ml={-1}
        mr={2}
      />
      <Box as="p">{props.user.display_name}</Box>
      <Button ml={2} variant="outline" size="xs" colorScheme={"primary"} onClick={() => {router.push({
                  pathname: "/league/" + props.user.league_id
                })}}>
        View
      </Button>
    </Center>
  );
};

export default UserCell;
