import { Spinner } from "@chakra-ui/react";
import { LineSeries, ResponsiveLine } from "@nivo/line";
import { useMemo } from "react";
import League from "../../../classes/custom/League";
import { project_colors } from "../../../utility/project_colors";

interface MyProps {
  league: League;
  memberId: number;
}

const TrendingLineChart = (props: MyProps) => {
  const {league, memberId} = props
  const data = useMemo(() => formatScoresForLineChart(league, memberId), [league, memberId]);
  const theme = {
    background: project_colors.surface[1],
    textColor: "white",
  };

  if (data == undefined || data.length <= 0) return <Spinner />;

  const leagueAvgPerWeek = league.weeks.size > 0 ? league.stats.avg_pf / league.weeks.size : 0

  return (
    <ResponsiveLine
      data={data}
      theme={theme}
      margin={{ top: 10, right: 25, bottom: 10, left: 5 }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      curve="cardinal"
      enableCrosshair={false}
      axisLeft={null}
      enableGridY={false}
      enableGridX={false}
      colors={{ scheme: "dark2" }}
      pointSize={3}
      pointColor={{ theme: "background" }}
      pointBorderWidth={1}
      pointBorderColor={{ from: "serieColor" }}
      useMesh={true}
      legends={[]}
      tooltip={({ point }) => {
        return (
          <div
            style={{
              padding: "1px",
              color: "white",
              fontSize: "12px",
            }}
          >
            <div>{`${Number(point.data.y).toFixed(2)}`}</div>
          </div>
        );
      }}

      markers = {[
        {
          axis: 'y',
          value: parseFloat(leagueAvgPerWeek.toFixed(2)),
          lineStyle: { stroke: 'lightgray', strokeWidth: 1 },
          legend: 'League Avg',
          legendOrientation: 'vertical',
          legendPosition: "right",
          textStyle: { fontSize: ".5em", fill: "gray"}

      }
    ]}
    />
  );
};

function formatScoresForLineChart(league: League, memberId: number): LineSeries[] | undefined {
  const member = league.members.get(memberId);
  if (!member) return undefined

  const weekScores: {x: string; y: number | null}[] = [];
  const startWeek = 1;
  const endWeek = league.weeks.size;

  for (let i = startWeek; i <= endWeek; i++) {
    const curWeek = league.weeks.get(i);
    if (curWeek) {
      weekScores.push({
        x: "Week " + curWeek.weekNumber,
        y: curWeek.getMemberMatchupSide(memberId)?.pf ?? null,
      });
    }
  }

  return [{
    id: member.name,
    data: weekScores,
  }];
}

export default TrendingLineChart;
