import { Spinner } from "@chakra-ui/react";
import { ResponsiveLine } from "@nivo/line";
import League from "../../../classes/custom/League";
import LeagueMember from "../../../classes/custom/LeagueMember";
import { project_colors } from "../../../utility/project_colors";

interface MyProps {
  league: League;
  memberId: number;
}

const TrendingLineChart = (props: MyProps) => {
  let data = formatScoresForLineChart(props.league, props.memberId) as any;
  const theme = {
    background: project_colors.surface[1],
    textColor: "white",
  };

  if (data.length <= 0) return <Spinner />;

  return (
    <ResponsiveLine
      data={data}
      margin={{ top: 10, right: 10, bottom: 10, left: 10 }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      curve="cardinal"
      enableCrosshair={false}
      axisRight={null}
      axisLeft={null}
      enableGridY={false}
      enableGridX={false}
      colors={{ scheme: "dark2" }}
      pointSize={3}
      pointColor={{ theme: "background" }}
      pointBorderWidth={1}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={[]}
      tooltip={({ point }) => {
        return (
          <div
            style={{
              background: "grey",
              padding: "1px",
              color: "black",
              fontSize: "12px",
            }}
          >
            <div>{`${parseFloat(point.data.y as any).toFixed(2)}`}</div>
          </div>
        );
      }}
    />
  );
};

function formatScoresForLineChart(league: League, memberId: number) {
  let member = league.members.get(memberId);
  let weekScores = [];
  if (member) {
    let startWeek = 1;
    let endWeek = league.weeks.size;

    for (let i = startWeek; i <= endWeek; i++) {
      let curWeek = league.weeks.get(i);
      if (curWeek) {
        weekScores.push({
          x: "Week " + curWeek.weekNumber,
          y: curWeek?.getMemberMatchupSide(memberId).pf,
        });
      }
    }
    let data = {
      id: member.name,
      data: weekScores,
    };

    return [data];
  }
}

export default TrendingLineChart;
