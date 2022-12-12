import {
  Box,
  Button,
  Center,
  Flex,
  HStack,
  pseudoPropNames,
} from "@chakra-ui/react";
import { useContext } from "react";
import { Context } from "../../contexts/Context";
import SettingsSidebar from "./SettingsSidebar";
import TeamSidebar from "./TeamSidebar";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import MobileSidebar from "./MobileSidebar";

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
      bgGradient="linear(to-r, secondary.600, secondary.700)"
      maxWidth={"100vw"}
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
        gap={0}
        spacing="0px"
        display={{ sm: "flex", base: "none" }}
        maxWidth={"100vw"}
        overflow="hidden"
      >
        
        <NavbarButton
          buttonText="VisuaLeague"
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
      <Link href={props.link} >
        <Button
          onClick={props.onclick}
          disabled={props.disabled ?? false}
          size={"md"}
          borderRadius={0}
          fontWeight={"medium"}
          colorScheme={"primary"}
          textColor="black"
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
        onClick={props.onclick}
        disabled={props.disabled ?? false}
        size={"md"}
        borderRadius={0}
        fontWeight={"medium"}
        colorScheme={"primary"}
        textColor="black"
        variant="ghost"
        aria-label={props.buttonText}
      >
        {props.buttonText}
      </Button>
    );
  }
}
