import { Box, Flex, HStack, Text } from "@chakra-ui/react";
import Link from "next/link";
import { useContext } from "react";
import { Context } from "../../contexts/Context";
import Sidebar from "./Sidebar";
function Navbar() {
  const [context, setContext] = useContext(Context);
  // Pass the computed styles into the `__css` prop
  return (
    <Flex bg={"secondary.600"} w="100%">
      <HStack spacing="24px" pl={3} paddingY={1} flex={1}>
        <Box as={"b"} fontSize="lg">
          <Link href="/">
            <a>Fanstatsy</a>
          </Link>
        </Box>

        
      </HStack>
      <Box mr={6}>
          {context.modifiedSettings && (<Sidebar/>)}
          </Box>
    </Flex>
  );
}

export default Navbar;
