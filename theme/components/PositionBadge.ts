import { ComponentStyleConfig } from "@chakra-ui/react";

const PositionBadge: ComponentStyleConfig = {
  // The styles all Cards have in common
  baseStyle: {},
  sizes: {
    sm: {
        fontSize: "sm",
        w: "34px",
        h: "32px",
        borderRadius: "8px",
        overflow: "hidden"
      },
    md: {
      fontSize: "md",
      w: "42px",
      h: "32px",
      borderRadius: "8px",
      overflow: "hidden"
    },
    lg: {fontSize: "lg",},
  },
  // Two variants: rounded and smooth
  variants: {
    QB: { bg: "position.QB" },
    RB: { bg: "position.RB" },
    WR: { bg: "position.WR" },
    TE: { bg: "position.TE" },
    DEF: { bg: "position.DEF" },
    K: { bg: "position.K" },
    DL: { bg: "position.DL" },
    LB: { bg: "position.LB" },
    DB: { bg: "position.DB" },
  },
  // The default variant value
  defaultProps: {
    size: "md",
    variant: "QB",
  },
};

export default PositionBadge;
