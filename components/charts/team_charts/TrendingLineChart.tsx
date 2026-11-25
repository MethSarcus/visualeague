import { Badge, Box, Spinner, useMediaQuery } from "@chakra-ui/react";
import { LineSeries, ResponsiveLine } from "@nivo/line";
import { useMemo } from "react";
import League from "../../../classes/custom/League";
import { project_colors } from "../../../utility/project_colors";
import ChartTooltip from '../ChartTooltip'

interface MyProps {
  league: League;
  memberId: number;
}

const TrendingLineChart = (props: MyProps) => {
  const {league, memberId} = props
  const [isOnMobile] = useMediaQuery('(max-width: 768px)')
  const data = useMemo(() => formatScoresForLineChart(league, memberId), [league, memberId]);
  const theme = {
    background: "transparent",
    textColor: project_colors.textTheme.mediumEmphasis,
    axis: {
      ticks: {
        text: {
          fill: project_colors.textTheme.mediumEmphasis,
          fontSize: 10,
        },
      },
    },
  };

  if (data == undefined || data.length <= 0) return <Spinner />;

  const leagueAvgPerWeek = league.weeks.size > 0 ? league.stats.avg_pf / league.weeks.size : 0

  return (
      <Box position='relative' width='100%' height='100%'>
      <Badge
        position='absolute'
        top={2}
        right={3}
        zIndex={1}
        color='textTheme.highEmphasis'
        bg='surface.0'
        border='1px solid'
        borderColor='whiteAlpha.200'
        fontSize='xs'
        fontWeight='medium'
        px={2}
        py={1}
      >
        League avg {leagueAvgPerWeek.toFixed(1)}
      </Badge>
      <ResponsiveLine
      data={data}
      theme={theme}
      margin={{ top: 12, right: isOnMobile ? 12 : 48, bottom: isOnMobile ? 10 : 26, left: isOnMobile ? 12 : 52 }}
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
      axisBottom={isOnMobile ? null : {
        tickSize: 0,
        tickPadding: 5,
        format: (value) => `Week (${value})`,
      }}
      colors={[project_colors.secondary[200]]}
      lineWidth={2}
      pointSize={4}
      pointColor={{ from: "series.color", modifiers: [["brighter", 1.1]] }}
      pointBorderWidth={0}
      useMesh={true}
      legends={[]}
      tooltip={({point}) => <ChartTooltip title={point.seriesId} rows={[{
        key: 'points', label: 'Points', value: Number(point.data.y).toFixed(2), color: point.seriesColor,
      }]} />}

      markers = {[
        {
          axis: 'y',
          value: parseFloat(leagueAvgPerWeek.toFixed(2)),
          lineStyle: {
            stroke: project_colors.textTheme.highEmphasis,
            strokeWidth: 1.5,
            strokeDasharray: '6 4',
          },

      }
    ]}
    />
      </Box>
  );
};

function formatScoresForLineChart(league: League, memberId: number): LineSeries[] | undefined {
  const member = league.members.get(memberId);
  if (!member) return undefined

  const weekScores: {x: number; y: number | null}[] = [];
  const startWeek = 1;
  const endWeek = league.weeks.size;

  for (let i = startWeek; i <= endWeek; i++) {
    const curWeek = league.weeks.get(i);
    if (curWeek) {
      weekScores.push({
        x: curWeek.weekNumber,
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
