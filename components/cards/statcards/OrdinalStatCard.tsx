import { Flex, Center, Spacer, Box, Text } from "@chakra-ui/react";

type MyProps = { statName: String; statValue: String };

export const OrdinalStatCard = (props: MyProps) => {
    return (
      <Flex
        my={1}
        py={3}
        px={0}
        maxW="xs"
        borderRadius={10}
        boxShadow={"2xl"}
        color="white"
        alignItems={"left"}
      >
        <Center>
          <Box mx={2} bg={"surface.1"} alignItems={"start"} fontWeight={"bold"} fontSize={"lg"} p={2}>1st</Box>
          <Box >
            <Text fontSize={"md"}>{props.statName}</Text>
            <Text fontSize={"sm"}>{props.statValue}</Text>
          </Box>
        </Center>
        <Spacer></Spacer>
      </Flex>
    )
  }