import { Spinner } from "@chakra-ui/react";
import { ResponsiveLine } from "@nivo/line";
import League from "../../../classes/custom/League";
import LeagueMember from "../../../classes/custom/LeagueMember";
import Trade from "../../../classes/custom/Trade";
import { project_colors } from "../../../utility/project_colors";

interface MyProps {
  trades: Trade[] | undefined
}

const WeeklyTradesLineChart = (props: MyProps) => {
  if (props.trades == undefined) return <Spinner />;
  let data = formatScoresForLineChart(props.trades) as any;
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
                    <div>{`${point.serieId}: ${parseFloat(point.data.y as any).toFixed(2)}`}</div>
                </div>
            )
        }}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "serieColor" }}
      useMesh={true}
      debugMesh={false}
    />
  );
};

function formatScoresForLineChart(trades: Trade[]) {
  let tradeData = {
    id: "trades",
    color: "#61cdbb",
    data: [] as object[]
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
        tradeData.data.push({x: ` Week ${weekNum} <`, y: tradeMap.get(weekNum)})
    } else {
        tradeData.data.push({x: `Week ${weekNum}`, y: tradeMap.get(weekNum)})
    }
    
  })
  


  return [tradeData];
}

export default WeeklyTradesLineChart;
