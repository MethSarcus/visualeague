"use client"
import { createMultiStyleConfigHelpers } from "@chakra-ui/react";

const helpers = createMultiStyleConfigHelpers([
  "header_container",
  "user_avatar",
  "names_container",
  "score_text",
  "projected_score_text",
]);
const MatchupHeaderTeam = helpers.defineMultiStyleConfig({
  // The base styles for each part
  baseStyle: {
    header_container: {
      background: "rgb(49,56,72)",
      p: 5,
      borderRadius: "15px",
      border: "solid",
      borderWidth: "thin",
      borderColor: "rgb(56,62,80)",
      overflow: "hidden",
    },

    user_avatar: {
      size: "xs"
    },

    names_container: {
      pl: 2,
    },
    score_text: {
      mt: "auto",
      mb: "auto",
      fontWeight: "semibold",
      color: "textTheme.highEmphasis",
      mr: 2,
    },
    projected_score_text: {
      mt: "auto",
      mb: "auto",
      fontWeight: "semibold",
      color: "textTheme.highEmphasis",
      mr: 2,
    }
  },
  // The size styles for each part
  sizes: {
    sm: {
      header_container: {
        fontSize: ".7em",
      },
      names_container: {},
      score_text: {},
    },
    lg: {
      names_container: {},
      score_text: {},
    },
  },
  // The variant styles for each part
  variants: {
    default: {},
    inverted: {
      header_container: {
        bg: "red",
      }
    },
  },
  // The default `size` or `variant` values
  defaultProps: {
    variant: "default",
    size: "sm",
  },
});

export default MatchupHeaderTeam;