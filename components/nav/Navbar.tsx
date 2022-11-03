import { Box, Flex, HStack } from "@chakra-ui/react";
import Link from "next/link";
import { useContext } from "react";
import { Context } from "../../contexts/Context";
import SettingsSidebar from "./SettingsSidebar";
import TeamSidebar from "./TeamSidebar";
function Navbar() {
  const [context, setContext] = useContext(Context);
  // Pass the computed styles into the `__css` prop
  return (
    <Flex bg={"secondary.600"} w="100%">
      <HStack spacing="24px" pl={3} paddingY={1} flex={1}>
      <Box mr={6}>
          {context.modifiedSettings && (<TeamSidebar/>)}
          </Box>
        <Box as={"b"} fontSize="lg">
          <Link href="/">
            <a>Fanstatsy</a>
          </Link>
        </Box>

        
      </HStack>
      <Box mr={6}>
          {context.modifiedSettings && (<SettingsSidebar/>)}
          </Box>
    </Flex>
  );
}

export default Navbar;
