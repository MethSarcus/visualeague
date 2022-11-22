import {
  Box,
    Card, Center, Flex, Image, Text,
    useMultiStyleConfig, VStack
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import League from "../../classes/custom/League";
import LeagueMember from "../../classes/custom/LeagueMember";
import TeamCardPFBarChart from "../charts/team_charts/TeamCardPFBarChart";
import TrendingLineChart from "../charts/team_charts/TrendingLineChart";

type MyProps = {
  league: League
  member: LeagueMember;
  variant: string;
  size: string;
};

const TeamCard = (props: MyProps) => {
  const { variant, size, ...rest } = props;
  const styles = useMultiStyleConfig("LeagueCard", { variant, size });
  const router = useRouter();

  return (
    <Card
      direction="row"
      boxShadow={"lg"}
      alignContent={"center"}
      alignItems={"center"}
      rounded={"md"}
      bg="surface.2"
      textColor={"white"}
    >
      <Image
        objectFit="cover"
        maxW={"100px"}
        src={`https://sleepercdn.com/avatars/thumbs/${props.member?.avatar}`}
        alt="Team Image"
      />
      <Center pl={2} as="b" fontSize="lg" __css={styles.league_name}>
        <VStack spacing={0} alignItems={"left"}>
          <Text>{props?.member?.name}</Text>
          <Text p={0}>
            ({props.member?.stats.wins} - {props.member?.stats.losses})
          </Text>
        </VStack>
        <Box color={"black"} w={["120px"]} h={["80px"]}>
        <TrendingLineChart league={props.league} memberId={props.member.roster.roster_id}/>
        </Box>

        

      </Center>
    </Card>
  );
};

export default TeamCard;
