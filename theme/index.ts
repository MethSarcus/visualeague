// theme/index.js
import { extendTheme } from "@chakra-ui/react";

// Global style overrides
import theme from "./theme";

// Component style overrides
import Card from "./components/CardTheme";
import DraftPickCard from "./components/DarftPickCardTheme";
import PositionBadge from "./components/PositionBadge";
import FlexPositionBadge from "./components/FlexPositionBadge";
import { borderRadius, sizes, spacing } from "./overrides/Layout";

const overrides = {
  theme,
  ...sizes,
  ...borderRadius,

  // Other foundational style overrides go here
  components: {
    Card,
    DraftPickCard,
    PositionBadge,
    FlexPositionBadge
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
    surface: {
      0: "#121212",
      1: "#1E1E1E",
      2: "#232323",
      3: "#252525",
      4: "#272727",
      5: "#292929",
      6: "#2C2C2C",
      7: "#2F2F2F",
      8: "#333333",
      9: "#353535",
      10: "#383838",
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
