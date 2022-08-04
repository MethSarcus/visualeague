import { ComponentStyleConfig } from "@chakra-ui/react";

const FlexPositionBadge: ComponentStyleConfig = {
  // The styles all Cards have in common
  baseStyle: {
    gap: 0,
    display: "inline-block"
  },
  variants: {
    FLEX: {columns: 3},
    SUPER_FLEX: {columns: 2},
    IDP_FLEX: {columns: 3},
    REC_FLEX: {columns: 2},
    WRRB_FLEX: {columns: 2},
    
  },
  sizes: {
    sm: {
      fontSize: "sm",
      w: "34px",
      h: "32px",
      borderRadius: "8px",
      overflow: "hidden"
    },
  md: {
    fontSize: ".6em",
    w: "42px",
    h: "32px",
    borderRadius: "8px",
    overflow: "hidden"
  },
  lg: {fontSize: "lg",},
  },
  defaultProps: {
    size: "md",
    variant: "SUPER_FLEX",
  },
};

export default FlexPositionBadge;
