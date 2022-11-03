import {
  Button, Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay, useDisclosure
} from "@chakra-ui/react";
import produce from "immer";
import React, { useContext } from "react";
import CustomSleeperLeague from "../../classes/custom/League";
import { LeagueSettings } from "../../classes/sleeper/LeagueSettings";
import { Context } from "../../contexts/Context";
import MemberList from "../groups/MemberList";

export default function TeamSidebar() {
  const [context, setContext] = useContext(Context);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [customSettings, setCustomSettings] = React.useState(
    context.modifiedSettings
  );
  const [checked, setChecked] = React.useState(
    context.settings.useModifiedSettings
  );

  const btnRef = React.useRef(null);

  function onCheckboxClick(e: any) {
    setChecked(e.target.checked);
  }

  const onInputChange = async (e: {
    target: { id: string | number; value: string };
  }) => {
    setCustomSettings(
      produce(customSettings, (draftState: LeagueSettings) => {
        (draftState.scoring_settings as any)[e.target.id] = parseFloat(
          e.target.value
        );
      })
    );
  };

  const onApplyPressed = () => {
    let settings = context.settings.scoring_settings;
    if (checked) {
      settings = customSettings.scoring_settings;
    }
    const nextState = produce(context, (draftState: CustomSleeperLeague) => {
      draftState.modifyStats(settings);
      draftState.useModifiedSettings = checked;
    });
    setContext(nextState);
  };

  return (
    <>
      {context.settings && (
        <Button size={"sm"} colorScheme={"secondary"} textColor="black" variant='ghost' onClick={onOpen}
        aria-label={"teams"}>
          Teams
        </Button>
      )}
      <Drawer isOpen={isOpen} placement="left"  onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={"surface.1"} textColor="white">
          <DrawerCloseButton />
          <DrawerHeader>
            Teams
            <br />
          </DrawerHeader>
          <DrawerBody p={0}>
            {context.settings && (<MemberList members={context.members} callback={() => {}}/>)}
          </DrawerBody>

          <DrawerFooter>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function formatScoreKey(key: string) {
  return key.replaceAll("_", " ");
}
