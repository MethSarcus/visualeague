import {
  Popover,
  PopoverTrigger,
  Button,
  PopoverContent,
  PopoverArrow,
  Stack,
  StackItem,
  PopoverHeader,
  PopoverBody,
  PopoverFooter,
  Box,
  Text,
  Badge,
  Code,
  HStack,
} from "@chakra-ui/react";
import {
  LeagueSettings,
  ScoringSettings,
} from "../interfaces/sleeper_api/LeagueSettings";
import {
  hasPremiumScoring,
  hasVariablePPR,
  POSITION,
} from "../utility/rosterFunctions";
import PositionBadge from "./PositionBadges/PositionBadge";
import FlexPositionBadge from "./PositionBadges/FlexPositionBadge";

type MyProps = {
  league: LeagueSettings;
};

const ScoringPopover = (props: MyProps) => {
  return (
    <Popover trigger="hover" placement="right">
      <PopoverTrigger>
        <Button
          as={"text"}
          variant="ghost"
          colorScheme="secondary_google"
          size="xs"
        >
          League Info
        </Button>
      </PopoverTrigger>
      <PopoverContent display="flex" bg={"surface_google.2"}>
        <PopoverArrow bg="surface_google.2" />
        <Stack direction={"row"} spacing={2}>
          <StackItem>
            <PopoverHeader>Positions</PopoverHeader>
            <PopoverBody>
              <Stack>
                {formatRosterForPopover(
                  props.league.roster_positions as string[]
                )}
              </Stack>
            </PopoverBody>
          </StackItem>
          <StackItem>
            <PopoverHeader>Scoring</PopoverHeader>
            <PopoverBody>
              <StackItem>
                {formatScoringForPopover(props.league.scoring_settings)}
              </StackItem>
            </PopoverBody>
          </StackItem>
        </Stack>
        {hasVariablePPR(props.league.scoring_settings) && (
          <PopoverFooter>
            {formatVarPPR(props.league.scoring_settings)}
          </PopoverFooter>
        )}
      </PopoverContent>
    </Popover>
  );
};

function formatRosterForPopover(rosterPositions: string[]): JSX.Element[] {
  let positionCounts = new Map<string, number>();
  rosterPositions.forEach((pos) => {
    if (positionCounts.has(pos)) {
      let curNumPosition = positionCounts.get(pos) as number;
      positionCounts.set(pos, curNumPosition + 1);
    } else {
      positionCounts.set(pos, 1);
    }
  });

  let textArr: JSX.Element[] = [];
  positionCounts.forEach((value, key) => {
    if (key in POSITION) {
      textArr.push(
        <HStack>
          <PositionBadge variant={key} size={"md"} />
          <Text>x{value}</Text>
        </HStack>
      );
    } else if (key != "BN") {
      textArr.push(
        <HStack>
        <FlexPositionBadge variant={key} size={"md"}/>
        <Text>x{value}</Text>
      </HStack>
        
      );
    }
  });

  return textArr;
}

function formatScoringForPopover(
  scoringSettings: ScoringSettings
): JSX.Element[] {
  let textArr: JSX.Element[] = [];
  textArr.push(
    <Text>
      <Code>PPR: {scoringSettings.rec}</Code>
    </Text>
  );

  textArr.push(
    <Text>
      <Code>Receiving TD: {scoringSettings.rec_td}</Code>
    </Text>
  );

  textArr.push(
    <Text>
      <Code>Passing TD: {scoringSettings.pass_td}</Code>
    </Text>
  );

  textArr.push(
    <Text>
      <Code>Int: {scoringSettings.pass_int}</Code>
    </Text>
  );
  if (scoringSettings.pass_sack) {
    textArr.push(
      <Text>
        <Code>Sack: {scoringSettings.pass_sack}</Code>
      </Text>
    );
  }

  if (hasPremiumScoring(scoringSettings)) {
    if (scoringSettings.bonus_rec_rb && scoringSettings.bonus_rec_rb > 0) {
      textArr.push(
        <Text>
          <Code>RB Bonus: {scoringSettings.bonus_rec_rb}</Code>
        </Text>
      );
    }
    if (scoringSettings.bonus_rec_wr && scoringSettings.bonus_rec_wr > 0) {
      textArr.push(
        <Text>
          <Code>WR Bonus: {scoringSettings.bonus_rec_wr}</Code>
        </Text>
      );
    }
    if (scoringSettings.bonus_rec_te && scoringSettings.bonus_rec_te > 0) {
      textArr.push(
        <Text>
          <Code>TE Bonus: {scoringSettings.bonus_rec_te}</Code>
        </Text>
      );
    }
  }

  return textArr;
}

function formatVarPPR(scoringSettings: ScoringSettings) {
  let varPPR = [];
  varPPR.push(<Text as="h6">Variable PPR</Text>);
  varPPR.push(
    <Text>
      <Code>0-5 yards: {scoringSettings.rec_0_4}</Code>
    </Text>
  );
  varPPR.push(
    <Text>
      <Code>5-9 yards: {scoringSettings.rec_5_9}</Code>
    </Text>
  );
  varPPR.push(
    <Text>
      <Code>10-19 yards: {scoringSettings.rec_10_19}</Code>
    </Text>
  );
  varPPR.push(
    <Text>
      <Code>20-29 yards: {scoringSettings.rec_20_29}</Code>
    </Text>
  );
  varPPR.push(
    <Text>
      <Code>30-39 yards: {scoringSettings.rec_30_39}</Code>
    </Text>
  );
  varPPR.push(
    <Text>
      <Code>40+ yards: {scoringSettings.rec_40p}</Code>
    </Text>
  );
  return varPPR;
}

export default ScoringPopover;
