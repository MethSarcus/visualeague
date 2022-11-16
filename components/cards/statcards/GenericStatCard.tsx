import { Box } from "@chakra-ui/react";
;

type MyProps = { statName: String; statValue: String, statOwner: string };

const GenericStatCard = (props: MyProps) => {

  return (
    <Box
      p={4}
      textAlign={"center"}
      bg={"surface"}
      border={"1px"}
      color={"white"}
      maxW="200px"
      borderRadius={4}
      boxShadow={"2xl"}
    >
      <Box p={1} fontWeight='semibold'>{props.statName}</Box>
      <Box p={1}>{props.statOwner}</Box>
      <Box p={1}>{props.statValue}</Box>
    </Box>
  );
};

export default GenericStatCard;


