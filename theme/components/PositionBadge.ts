import { ComponentStyleConfig } from "@chakra-ui/react";
import { project_colors } from "../../utility/project_colors";

const PositionBadge: ComponentStyleConfig = {
  // The styles all Cards have in common
  baseStyle: {},
  sizes: {
    xs: {
      fontSize: ".8em",
      w: "24px",
      h: "22px",
      borderRadius: "8px",
      overflow: "hidden"
    },
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
    BN: { bg: project_colors.sleeper.badge_background},
    SLEEPER: { bg: project_colors.sleeper.badge_background}
  },
  // The default variant value
  defaultProps: {
    size: "md",
    variant: "QB",
  },
};

export default PositionBadge;
