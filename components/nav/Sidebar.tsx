import {
  Avatar,
  Button,
  Center,
  Divider,
  Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  Flex,
  FormLabel,
  Heading,
  HStack,
  IconButton,
  Input,
  NumberInput,
  NumberInputField,
  Switch,
  Text,
  useDisclosure,
  VStack,
} from "@chakra-ui/react";
import { HamburgerIcon } from "@chakra-ui/icons";
import { useContext, useEffect, useRef, useState } from "react";
import produce from "immer";
import React from "react";
import CustomSleeperLeague from "../../classes/custom/League";
import { LeagueSettings } from "../../classes/sleeper/LeagueSettings";
import { Context } from "../../contexts/Context";

export default function Sidebar() {
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
        <Button colorScheme="teal" onClick={onOpen}>
          Open
        </Button>
      )}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>
            {" "}
            League Settings
            <br />
            {context && (
              <HStack align={"start"}>
                <FormLabel htmlFor="isChecked">Use Custom Settings</FormLabel>
                <Switch
                  id="isChecked"
                  isChecked={checked}
                  onChange={onCheckboxClick}
                />
              </HStack>
            )}
          </DrawerHeader>
          <DrawerBody>
            {context.settings && (
              <VStack align={"start"}>
                {Object.keys(context.modifiedSettings.scoring_settings).map(
                  (setting) => {
                    return (
                      <Center key={setting}>
                        {formatScoreKey(setting)}:{" "}
                        <NumberInput
                        ml={2}
                        colorScheme={"primary"}
                          isDisabled={!checked}
                          variant={"filled"}
                          size="sm"
                          defaultValue={
                            context.modifiedSettings.scoring_settings[setting]
                          }
                        >
                          <NumberInputField
                          size={1}
                            id={setting}
                            onChange={onInputChange}
                          />
                        </NumberInput>
                      </Center>
                    );
                  }
                )}
              </VStack>
            )}
          </DrawerBody>

          <DrawerFooter>
          <Button size={"sm"} onClick={onClose} variant="ghost">
              Close
            </Button>
            <Button size={"sm"} onClick={onApplyPressed} colorScheme={"primary"} >
              Apply
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  );
}

function formatScoreKey(key: string) {
  return key.replaceAll("_", " ");
}
