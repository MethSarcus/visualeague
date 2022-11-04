import { Spinner } from "@chakra-ui/react";
import { ResponsivePie } from "@nivo/pie";
import { MatchupPlayer } from "../../classes/custom/MatchupPlayer";
import { SleeperPlayerDetails } from "../../classes/custom/Player";
import { PositionColors } from "./ChartColors";

interface MyProps {
  players: MatchupPlayer[];
  playerDetails?: Map<string, SleeperPlayerDetails>;
}



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
        color: PositionColors[player.eligiblePositions[0]],
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
      margin={{ top: 80, right: 80, bottom: 80, left: 80 }}
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
