import {
  Button,
  Center, Drawer,
  DrawerBody,
  DrawerCloseButton,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay, FormLabel, HStack,
  IconButton, Input, NumberInput,
  NumberInputField,
  Switch, Tooltip,
  useDisclosure,
  VStack
} from "@chakra-ui/react";
import produce from "immer";
import React, { useContext } from "react";
import { GoGear } from "react-icons/go";
import CustomSleeperLeague from "../../classes/custom/League";
import { LeagueSettings } from "../../classes/sleeper/LeagueSettings";
import { Context } from "../../contexts/Context";

export default function SettingsSidebar() {
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
        <IconButton
        bg={"none"}
        _hover={{background: "primary.100"}}
          icon={<GoGear/>}
          onClick={onOpen}
          aria-label={"settings"}
        />
      )}
      <Drawer isOpen={isOpen} placement="right" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent bg={"surface.1"} textColor="white">
          <DrawerCloseButton />
          <DrawerHeader>
            League Settings
            <br />
            {context && (
              <VStack align={"start"} >
                <Center>
                <FormLabel size={"xs"} htmlFor="isChecked">Use Custom Settings</FormLabel>
                <Switch
                  id="isChecked"
                  isChecked={checked}
                  onChange={onCheckboxClick}
                />
                </Center>
              </VStack>
            )}
          </DrawerHeader>
          <DrawerBody>
            {context.settings && (
              <VStack align={"start"}>
                {Object.keys(context.modifiedSettings.scoring_settings)
                  .sort(function (a, b) {
                    return a.localeCompare(b);
                  })
                  // .filter(setting => setting.includes(searchTerm))
                  .map((setting) => {
                    return (
                      <Center key={setting} visibility={"visible"}>
                        {formatScoreKey(setting)}:{" "}
                        <NumberInput
                          ml={2}
                          isInvalid={
                            customSettings.scoring_settings[setting] !=
                            context.settings.scoring_settings[setting]
                          }
                          isDisabled={!checked}
                          variant={"filled"}
                          size="sm"
                          textColor={"white"}
                          defaultValue={
                            context.modifiedSettings.scoring_settings[setting]
                          }
                        >
                          <Tooltip
                            isDisabled={
                              customSettings.scoring_settings[setting] ==
                              context.settings.scoring_settings[setting]
                            }
                            label={
                              "Original Value: " +
                              context.settings.scoring_settings[setting]
                            }
                            placement={"right"}
                          >
                            <NumberInputField
                              size={1}
                              bg={"surface.2"}
                              _hover={{ background: "surface.3" }}
                              id={setting}
                              onChange={onInputChange}
                            />
                          </Tooltip>
                        </NumberInput>
                      </Center>
                    );
                  })}
              </VStack>
            )}
          </DrawerBody>

          <DrawerFooter>
            <Button size={"sm"} onClick={onClose} variant="ghost">
              Close
            </Button>
            <Button
              size={"sm"}
              onClick={onApplyPressed}
              colorScheme={"primary"}
            >
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
