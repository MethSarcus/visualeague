import { Spinner } from "@chakra-ui/react";
import { ResponsiveBump } from "@nivo/bump";
import { ResponsiveLine } from "@nivo/line";
import CustomSleeperLeague from "../../classes/custom/League";
import LeagueMember from "../../classes/custom/LeagueMember";
import {
  getPositionColor,
  POSITION,
  project_colors,
} from "../../utility/rosterFunctions";

interface MyProps {
  league: CustomSleeperLeague;
}

const LineChart = (props: MyProps) => {
  let data = formatScoresForLineChart(props.league) as any;
  const theme = {
    background: project_colors.surface[1],
    textColor: "white",
  };

  if (data.length <= 0) return <Spinner />;

  return (
    <ResponsiveLine
      data={data}
      theme={theme}
      margin={{ top: 50, right: 110, bottom: 50, left: 60 }}
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
        legend: "Week",
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

function formatScoresForLineChart(league: CustomSleeperLeague) {
  let data: object[] = [];
  let memberWeekScoreMap: Map<number, object[]> = new Map();

  league.weeks.forEach((week) => {
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

  league.members.forEach((member: LeagueMember) => {
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