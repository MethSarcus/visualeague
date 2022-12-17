import { Spinner } from "@chakra-ui/react";
import { ResponsiveLine } from "@nivo/line";
import League from "../../classes/custom/League";
import LeagueMember from "../../classes/custom/LeagueMember";
import { project_colors } from "../../utility/project_colors";

interface MyProps {
  league: League | undefined;
}

const LineChart = (props: MyProps) => {
  if (props.league?.settings == undefined) return <Spinner />;
  let data = formatScoresForLineChart(props.league) as any;
  const theme = {
    background: project_colors.surface[1],
    textColor: "white",
  };



  return (
    <ResponsiveLine
      data={data}
      theme={theme}
      margin={{ top: 20, right: 170, bottom: 50, left: 60 }}
      curve="linear"
      enableGridX={false}
      enableCrosshair={false}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: 0,
        max: "auto",
        stacked: false,
        reverse: false,
      }}
      yFormat=" >-.1f"
      axisTop={null}
      axisRight={null}
      enableSlices={false}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: "PF",
        legendOffset: -40,
        legendPosition: "middle",
      }}
      pointSize={10}
      tooltip={({ point }) => {
            return (
                <div
                    style={{
                        background: 'white',
                        padding: '9px 12px',
                        border: '1px solid #ccc',
                        color: "black"
                    }}
                >
                    <div>{`${point.serieId}: ${parseFloat(point.data.y as any).toFixed(2)}`}</div>
                </div>
            )
        }}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      pointLabelYOffset={-12}
      useMesh={true}
      debugMesh={false}
      legends={[
        {
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          toggleSerie: true,
          translateX: 100,
          translateY: 0,
          itemsSpacing: 0,
          itemDirection: "left-to-right",
          itemWidth: 80,
          itemHeight: 20,
          itemOpacity: 0.75,
          symbolSize: 12,
          symbolShape: "circle",
          symbolBorderColor: "rgba(0, 0, 0, .5)",
          effects: [
            {
              on: "hover",
              style: {
                itemBackground: "rgba(0, 0, 0, .03)",
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
    />
  );
};

function formatScoresForLineChart(league: League | undefined) {
  let data: object[] = [];
  let memberWeekScoreMap: Map<number, object[]> = new Map();

  league?.weeks?.forEach((week) => {
    week.getAllScores().forEach((team) => {
      if (memberWeekScoreMap.has(team.id)) {
        (memberWeekScoreMap.get(team.id) as object[]).push({
          x: "Week " + week.weekNumber,
          y: team.score,
        });
      } else {
        memberWeekScoreMap.set(team.id, [
          {
            x: "Week " + week.weekNumber,
            y: team.score,
          },
        ]);
      }
    });
  });

  league?.members?.forEach((member: LeagueMember) => {
    if (league.memberIdToRosterId.has(member.userId)) {
      data.push({
        id: member.name,
        data: memberWeekScoreMap.get(
          league.memberIdToRosterId.get(member.userId) as number
        ),
      });
    }
  });
  return data;
}

export default LineChart;
