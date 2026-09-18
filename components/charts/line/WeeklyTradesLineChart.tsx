import { Spinner } from "@chakra-ui/react";
import { LineSeries, ResponsiveLine } from "@nivo/line";
import { useMemo } from "react";
import Trade from "../../../classes/custom/Trade";
import { project_colors } from "../../../utility/project_colors";

interface MyProps {
  trades: Trade[] | undefined
}

const WeeklyTradesLineChart = (props: MyProps) => {
  const trades = props.trades
  const data = useMemo(() => (trades == undefined ? undefined : formatScoresForLineChart(trades)), [trades]);
  if (data == undefined) return <Spinner />;
  const theme = {
    background: project_colors.surface[1],
    textColor: "white",
  };



  return (
    <ResponsiveLine
      data={data}
      theme={theme}
      margin={{ top: 20, right: 40, bottom: 40, left: 60 }}
      enableGridX={false}
      enableCrosshair={false}
      tooltip={({ point }) => {
            return (
                <div
                    style={{
                        background: project_colors.surface[0],
                        padding: '9px 12px',
                        border: '1px solid #ccc',
                        color: "white"
                    }}
                >
                    <div>{`${point.seriesId}: ${Number(point.data.y).toFixed(2)}`}</div>
                </div>
            )
        }}
      pointColor={{ from: "series.color", modifiers: [["brighter", 1.1]] }}
      pointBorderWidth={0}
      useMesh={true}
      debugMesh={false}
    />
  );
};

function formatScoresForLineChart(trades: Trade[]): LineSeries[] {
  const tradeData = {
    id: "trades",
    color: "#61cdbb",
    data: [] as {x: string; y: number}[]
  }
  let latestWeek = 1
  let tradeMap = new Map<number, number>()

  trades.forEach(trade => {
    if (trade.leg > latestWeek) {
      latestWeek = trade.leg
    }
    if (tradeMap.has(trade.leg)) {
        let curNumTrades = tradeMap.get(trade.leg) as number
        tradeMap.set(trade.leg, curNumTrades + 1)
    } else {
        tradeMap.set(trade.leg, 1)
    }
  })

  let weekKeys = Array.from({length: latestWeek}, (_, i) => i + 1)
  weekKeys.forEach(weekNum => {
    if (!tradeMap.has(weekNum)) {
      tradeMap.set(weekNum, 0)
    }
  })

  Array.from(weekKeys).forEach((weekNum) => {
    if (weekNum == 1) {
        tradeData.data.push({x: ` Week ${weekNum} <`, y: tradeMap.get(weekNum) ?? 0})
    } else {
        tradeData.data.push({x: `Week ${weekNum}`, y: tradeMap.get(weekNum) ?? 0})
    }
    
  })
  


  return [tradeData];
}

export default WeeklyTradesLineChart;
