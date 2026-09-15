import { Spinner } from "@chakra-ui/react";
import { ResponsivePie } from "@nivo/pie";
import { useContext } from "react";
import { MatchupPlayer } from "../../classes/custom/MatchupPlayer";
import { SleeperPlayerDetails } from "../../classes/custom/Player";
import { LeagueContext } from "../../contexts/LeagueContext";
import { PositionColors } from "./ChartColors";

interface MyProps {
  players: MatchupPlayer[];
  playerDetails?: Map<string, SleeperPlayerDetails>;
  margins?: { top: number; right: number; bottom: number; left: number };
}

interface PieDatum {
  id: string;
  label: string;
  value: number;
  position: string;
  color: string;
}

const LineupPieChart = (props: MyProps) => {
  const [context] = useContext(LeagueContext);
  if (!props.players || context.settings == undefined) return <Spinner />;
  const margins = props.margins ?? { top: 80, right: 100, bottom: 80, left: 100 };

  const formatScoresForPieChart = (players: MatchupPlayer[]): PieDatum[] => {
    return players.map((player) => {
      const isBlank = !player?.playerId || player.playerId === "0";
      let fullName = "Empty";
      if (!isBlank && player.playerId) {
        const details = context.playerDetails?.get(player.playerId);
        fullName = details
          ? `${details.first_name} ${details.last_name}`
          : player.playerId;
      }
      const position = player.eligiblePositions?.[0] ?? "BN";
      return {
        id: fullName,
        label: fullName,
        value: Number((player.score ?? 0).toFixed(2)),
        position,
        color: PositionColors[position],
      };
    });
  };

  const data = formatScoresForPieChart(props.players);

  const CenteredMetric = ({
    dataWithArc,
    centerX,
    centerY,
  }: {
    dataWithArc: readonly {value: number}[];
    centerX: number;
    centerY: number;
  }) => {
    const total = dataWithArc.reduce((sum, datum) => sum + datum.value, 0);

    return (
      <text
        x={centerX}
        y={centerY}
        textAnchor="middle"
        dominantBaseline="central"
        style={{
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
      sortByValue={true}
      colors={{ datum: "data.color" }}
      margin={margins}
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
