import {
  Center, SimpleGrid, useStyleConfig
} from "@chakra-ui/react";

type MyProps = {
  variant: string;
  size: string;
};

const FLEX_VARIANT_POSITIONS: Record<string, { label: string; bg: string; height: string }[]> = {
  SUPER_FLEX: [
    { label: "W", bg: "position.WR", height: "50%" },
    { label: "R", bg: "position.RB", height: "50%" },
    { label: "T", bg: "position.TE", height: "50%" },
    { label: "Q", bg: "position.QB", height: "50%" },
  ],
  REC_FLEX: [
    { label: "W", bg: "position.WR", height: "100%" },
    { label: "T", bg: "position.TE", height: "100%" },
  ],
  WRRB_FLEX: [
    { label: "W", bg: "position.WR", height: "100%" },
    { label: "R", bg: "position.RB", height: "100%" },
  ],
  IDP_FLEX: [
    { label: "DL", bg: "position.DL", height: "100%" },
    { label: "DB", bg: "position.DB", height: "100%" },
    { label: "LB", bg: "position.LB", height: "100%" },
  ],
  FLEX: [
    { label: "W", bg: "position.WR", height: "100%" },
    { label: "R", bg: "position.RB", height: "100%" },
    { label: "T", bg: "position.TE", height: "100%" },
  ],
};

const FlexPositionBadge = (props: MyProps) => {
  const { variant, size, ...rest } = props;
  const styles = useStyleConfig("FlexPositionBadge", { variant, size });
  const includedPositions = FLEX_VARIANT_POSITIONS[variant] ?? [];

  return (
    <SimpleGrid __css={styles} {...rest}>
      {includedPositions.map((position) => (
        <Center key={position.label} h={position.height} bg={position.bg}>
          {position.label}
        </Center>
      ))}
    </SimpleGrid>
  );
};

export default FlexPositionBadge;
