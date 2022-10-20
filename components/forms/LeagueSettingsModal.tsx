import {
  useDisclosure,
  RadioGroup,
  Stack,
  Radio,
  Button,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  NumberDecrementStepper,
  NumberIncrementStepper,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  Wrap,
  WrapItem,
  Box,
  Center,
  VStack,
  Checkbox,
  FormControl,
  FormLabel,
  SimpleGrid,
  Switch,
  HStack,
} from "@chakra-ui/react";
import produce from "immer";
import React, { useContext, useEffect } from "react";
import CustomSleeperLeague from "../../classes/custom/League";
import { LeagueSettings } from "../../classes/sleeper/LeagueSettings";
import { Context } from "../../contexts/Context";

const LeagueSettingsModal = () => {
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
    let settings = context.settings.scoring_settings
    if (checked) {
      settings = customSettings.scoring_settings
    }
    const nextState = produce(context, (draftState: CustomSleeperLeague) => {
      draftState.modifyStats(settings);
      draftState.useModifiedSettings = checked;
    });
    console.log(nextState);
    setContext(nextState);
  };

  return (
    <>
      <Button size={"sm"} ref={btnRef} p={1} onClick={onOpen}>
        Alter Settings
      </Button>

      <Modal
        onClose={onClose}
        finalFocusRef={btnRef}
        isOpen={isOpen}
        scrollBehavior={"inside"}
      >
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            League Settings
            <br />
            {context && (<HStack align={"start"}>
                <FormLabel htmlFor="isChecked">Use Custom Settings</FormLabel>
                <Switch id="isChecked" isChecked={checked} onChange={onCheckboxClick}/></HStack>
            )}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            {context.settings && (
              <VStack align={"start"}>
                {Object.keys(context.modifiedSettings.scoring_settings).sort(function(a,b){
    return a.localeCompare(b);
}).map(
                  (setting) => {
                    return (
                      <Center key={setting}>
                        {formatScoreKey(setting)}:{" "}
                        <NumberInput
                          isDisabled={!checked}
                          variant={"filled"}
                          size="xs"
                          ml={1}
                          maxW={7}
                          defaultValue={
                            context.modifiedSettings.scoring_settings[setting]
                          }
                        >
                          <NumberInputField
                            id={setting}
                            padding={2}
                            onChange={onInputChange}
                          />
                        </NumberInput>
                      </Center>
                    );
                  }
                )}
              </VStack>
            )}
          </ModalBody>
          <ModalFooter>
            <Button size={"sm"} onClick={onClose}>
              Close
            </Button>
            <Button size={"sm"} onClick={onApplyPressed} variant="ghost">
              Apply
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  );
};

export default LeagueSettingsModal;

function formatScoreKey(key: string) {
  return key.replaceAll("_", " ");
}
function onCheckboxClick(e: any) {
  throw new Error("Function not implemented.");
}
