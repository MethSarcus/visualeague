import {
  Button,
  Card,
  CardBody,
  CardFooter,
  Heading,
  Stack,
  Text,
  useMultiStyleConfig,
  Image,
  Box,
  CardHeader,
  StackDivider,
  Avatar,
  Center,
  Flex,
  VStack,
  ButtonGroup,
  Spacer,
  StatLabel,
  Stat,
  StatArrow,
  StatHelpText,
  StatNumber,
} from "@chakra-ui/react";
import { useRouter } from "next/router";
import LeagueMember from "../../classes/custom/LeagueMember";

type MyProps = {
  member: LeagueMember;
  variant: string;
  size: string;
};

const TeamCard = (props: MyProps) => {
  const { variant, size, ...rest } = props;
  const styles = useMultiStyleConfig("LeagueCard", { variant, size });
  const router = useRouter();

  return (
    // <VStack color={"textTheme.highEmphasis"} alignItems={"center"}>

    //   <Text as="p">{`${props.member?.name}`} </Text>
    //   <Text as="p">({props.member?.stats.wins} - {props.member?.stats.losses})</Text>

    // </VStack>
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
      </Center>
    </Card>
  );
};

export default TeamCard;
