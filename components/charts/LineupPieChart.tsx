import { Spinner } from "@chakra-ui/react";
import { ResponsivePie } from "@nivo/pie";
import { MatchupPlayer } from "../../classes/custom/MatchupPlayer";
import { SleeperPlayerDetails } from "../../classes/custom/Player";
import {
  project_colors,
} from "../../utility/rosterFunctions";

interface MyProps {
  players: MatchupPlayer[];
  playerDetails?: Map<string, SleeperPlayerDetails>;
}
const colors: Record<string, string> = {
  QB: "hsl(338, 79%, 70%)",
  RB: "rgba(143, 242, 202, 0.95)",
  WR: "rgba(86, 201, 248, 0.95)",
  TE: "rgba(254, 174, 88, 0.95)",
  DL: "rgba(250, 153, 97, 0.95)",
  DB: "rgba(254, 160, 202, 0.95)",
  LB: "rgba(174, 182, 252, 0.95)",
  K: "#7988a1",
  DEF: "#bd66ff",
};

const theme = {
  background: project_colors.surface[1],
  textColor: project_colors.surface[1],
};

const LineupPieChart = (props: MyProps) => {


  const formatScoresForPieChart = (players: MatchupPlayer[]) => {
    return players.map((player) => {
      let fullName: any =
        (player && player.playerId && player.playerId != "0") || "Empty";
      if (props.playerDetails != undefined && fullName != "Empty") {
        fullName = `${
          props.playerDetails!!.get(player.playerId!!)!!.first_name
        } ${props.playerDetails!!.get(player.playerId!!)!!.last_name}`;
      }
      return {
        id: fullName,
        label: fullName,
        value: player.score.toFixed(2),
        position: player.eligiblePositions[0],
        color: colors[player.eligiblePositions[0]],
      };
    });
  };

  let data = formatScoresForPieChart(props.players);

  const CenteredMetric = ({ dataWithArc, centerX, centerY }: any) => {
    let total: number = 0;
    dataWithArc.forEach((datum: { value: number }) => {
      total += parseFloat(datum.value as any);
    });

    return (
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
          fontSize: "3em",
          fontWeight: 600,
          fill: "white",
        }}
      >
        {total.toFixed(2)}
      </text>
    );
  };

  if (data.length <= 0) return <Spinner />;

  return (
    <ResponsivePie
      data={data}
      theme={theme}
      sortByValue={true}
      colors={{ datum: "data.color" }}
      margin={{ top: 40, right: 80, bottom: 80, left: 80 }}
      innerRadius={0.5}
      padAngle={0.7}
      cornerRadius={3}
      activeOuterRadiusOffset={8}
      borderWidth={1}
      borderColor={{
        from: "color",
        modifiers: [["darker", 0.2]],
      }}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor={{ from: "color" }}
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      arcLabelsSkipAngle={10}
      layers={["arcs", "arcLabels", "arcLinkLabels", "legends", CenteredMetric]}
    />
  );
};

export default LineupPieChart;
