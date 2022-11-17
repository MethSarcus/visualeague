import { Box } from "@chakra-ui/react";
;

type MyProps = { statName: String; statValue: String, statOwner: string };

const GenericStatCard = (props: MyProps) => {

  return (
    <Box
      p={2}
      textAlign={"center"}
      bg={"surface.0"}
      border={"1px"}
      
      borderRadius={4}
      boxShadow={"2xl"}
    >
      <Box fontWeight='black' fontSize={".5em"} color={"textTheme.mediumEmphasis"}>{props.statName}</Box>
      <Box fontSize={".7em"} fontWeight={"medium"} color={"textTheme.highEmphasis"}>{props.statOwner}</Box>
      <Box fontSize={".5em"} fontWeight="light" color={"textTheme.mediumEmphasis"}>{props.statValue}</Box>
    </Box>
  );
};

export default GenericStatCard;


