// theme/index.js
"use client"
import { extendTheme } from "@chakra-ui/react";

// Global style overrides
import theme from "./theme";

// Component style overrides
import Card from "./components/CardTheme";
import DraftPickCard from "./components/DarftPickCardTheme";
import PositionBadge from "./components/PositionBadge";
import FlexPositionBadge from "./components/FlexPositionBadge";
import { borderRadius } from "./overrides/Layout";
//import MatchupHeaderTeam from "./components/MatchupHeaderTeam";
// import { borderRadius, sizes, spacing } from "./overrides/Layout";

const overrides = {
  theme,
  // ...sizes,
  ...borderRadius,

  // Other foundational style overrides go here
  components: {
    Card,
    DraftPickCard,
    PositionBadge,
    FlexPositionBadge,
    //MatchupHeaderTeam
  },
  colors: {
    primary: {
      50: "#f4ebfe",
      100: "#e2cdfd",
      200: "#cfabfd",
      300: "#bb86fc",
      400: "#aa67f9",
      500: "#994af1",
      600: "#8e44ea",
      700: "#803be0",
      800: "#7335d8",
      900: "#5f27ca",
    },
    secondary: {
      50: "#d4f6f2",
      100: "#92e9dc",
      200: "#03dac4",
      300: "#00c7ab",
      400: "#00b798",
      500: "#00a885",
      600: "#009a77",
      700: "#008966",
      800: "#007957",
      900: "#005b39",
    },
    secondary_inverted: {
    90: "#d4f6f2",
    800: "#92e9dc",
    700: "#03dac4",
    600: "#00c7ab",
    500: "#00b798",
    400: "#00a885",
    300: "#009a77",
    200: "#008966",
    100: "#007957",
    50: "#005b39",
  },
    surface: {
      0: "rgb(37, 37, 37)",
      1: "rgb(56, 56, 56)",
      2: "rgb(75, 75, 75)",
      3: "rgb(94, 94, 94)",
      4: "rgb(113, 113, 113)",
      5: "rgb(132, 132, 132)",
      6: "rgb(5, 5, 5)",
      7: "rgb(151, 151, 151)",
      8: "rgb(189, 189, 189)",
      9: "rgb(208, 208, 208)",
      10: "rgb(226, 226, 226)",
    },
    textTheme: {
      highEmphasis: "#E0E0E0",
      mediumEmphasis: "#A0A0A0",
      disabled: "#6C6C6C"
    },
    statColor: {
      good: "rgb(151,245,143, .8)",
      bad: "#B00020",
      neutral: "rgb(56, 56, 56)"
    },
    position: {
      QB: "rgba(239, 116, 161, 0.8)",
      RB: "rgba(143, 242, 202, 0.8)",
      WR: "rgba(86, 201, 248, 0.8)",
      TE: "rgba(254, 174, 88, 0.8)",
      DL: "rgba(250, 153, 97, 0.8)",
      DB: "rgba(254, 160, 202, 0.8)",
      LB: "rgba(174, 182, 252, 0.8)",
      K: "#7988a1",
      DEF: "#bd66ff"
    }
  },
};

export default extendTheme(overrides);
