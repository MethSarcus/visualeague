import { Box } from "@chakra-ui/react";
;

type MyProps = { statName: String; statValue: String };

const GenericStatCard = (props: MyProps) => {

  return (
    <Box
      p={6}
      textAlign={"center"}
      bg={"surface.1"}
      maxW="lg"
      borderRadius={7}
      boxShadow={"2xl"}
      color="white"
    >
      <Box p={1} fontWeight='semibold'>{props.statName}</Box>
      <Box p={1}>{props.statValue}</Box>
    </Box>
  );
};

export default GenericStatCard;


