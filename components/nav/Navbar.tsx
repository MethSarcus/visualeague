import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  Icon,
  IconButton,
  pseudoPropNames,
} from "@chakra-ui/react";
import { useContext } from "react";
import { Context } from "../../contexts/Context";
import SettingsSidebar from "./SettingsSidebar";
import TeamSidebar from "./TeamSidebar";
import { useRouter, usePathname } from "next/navigation";
import logo from "../../public/images/logo.png";
import Link from "next/link";
import MobileSidebar from "./MobileSidebar";
import Image from "next/image";

interface MyProps {
  leagueID: string | undefined;
}

function Navbar(props: MyProps) {
  const [context, setContext] = useContext(Context);
  const buttonColor = {
    50: "#surface.300",
    500: "#surface.500",
    900: "surface.800",
  };

  return (
    <Flex
      bg={"secondary.600"}
      bgGradient="linear(to-r, surface.1, surface.0)"
      maxWidth={"100vw"}
      color={"white"}
    >
      <HStack
        spacing="0px"
        pl={3}
        paddingY={1}
        flex={1}
        display={{ sm: "none", base: "flex" }}
        maxWidth={"100vw"}
        overflow="hidden"
      >
        <MobileSidebar />
        <NavbarButton
          buttonText="VisuaLeague"
          disabled={context.settings == undefined}
          link={`league/${context.settings?.league_id}`}
        />
      </HStack>
      <HStack
        py={0}
        my={0}
        flex={1}
        mx={6}
        gap={0}
        spacing="0px"
        display={{ sm: "flex", base: "none" }}
        maxWidth={"100vw"}
        overflow="hidden"
      >
        <Link href={`/`}>
          <Box
            pl={3}
            pr={2}
            transition={"all .2s ease-in-out"}
            _hover={{
              transform: "scale(1.05)",
              backgroundColor: "surface.0",
              cursor: "pointer",
            }}
          >
            <Image alt="Visualeague" height={40} src={logo} />
          </Box>
        </Link>
        <NavbarButton
          buttonText="League"
          link={`league/${context.settings?.league_id}`}
        />
        <TeamSidebar />
        <NavbarButton
          buttonText="Power Rankings"
          link={`league/${context?.settings?.league_id}/ranks`}
        />
        <NavbarButton
          buttonText="Trading"
          link={`league/${context?.settings?.league_id}/trades`}
        />
      </HStack>
      <Center pr={3}>{context.modifiedSettings && <SettingsSidebar />}</Center>
    </Flex>
  );
}

export default Navbar;

interface NavButtonProps {
  buttonText: string;
  link?: string;
  disabled?: boolean;
  onclick?: () => void;
}
function NavbarButton(props: NavButtonProps) {
  if (props.link != undefined) {
    return (
      <Link href={props.link}>
        <Button
                    transition={"all .2s ease-in-out"}
                    _hover={{
                      transform: "scale(1.05)",
                      backgroundColor: "surface.0",
                      cursor: "pointer",
                    }}
          onClick={props.onclick}
          disabled={props.disabled ?? false}
          size={"md"}
          borderRadius={0}
          fontWeight={"medium"}
          colorScheme={"primary"}
          textColor="white"
          variant="ghost"
          aria-label={props.buttonText}
        >
          {props.buttonText}
        </Button>
      </Link>
    );
  } else {
    return (
      <Button
      transition={"all .2s ease-in-out"}
      _hover={{
        transform: "scale(1.05)",
        backgroundColor: "surface.0",
        cursor: "pointer",
      }}
        onClick={props.onclick}
        disabled={props.disabled ?? false}
        size={"md"}
        borderRadius={0}
        fontWeight={"medium"}
        colorScheme={"primary"}
        textColor="white"
        variant="ghost"
        aria-label={props.buttonText}
      >
        {props.buttonText}
      </Button>
    );
  }
}
