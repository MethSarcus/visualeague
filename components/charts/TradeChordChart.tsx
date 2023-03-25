import { Box, Spinner } from '@chakra-ui/react';
import { ArcTooltipComponentProps, ResponsiveChord, RibbonTooltipComponentProps, ChordArcMouseHandler } from '@nivo/chord';
import { BasicTooltip, Chip, TableTooltip } from '@nivo/tooltip';
import React, { useContext } from 'react';
import LeagueMember from '../../classes/custom/LeagueMember';
import { SleeperTransaction } from '../../classes/sleeper/SleeperTransaction';
import { LeagueContext } from '../../contexts/LeagueContext';
import { project_colors } from "../../utility/project_colors";


interface MyProps {
    trades: SleeperTransaction[]

}


const TradeChordChart = (props: MyProps) => {
    let context = useContext(LeagueContext)

    if (!context[0].members) return <Box>Loading...</Box>
    let data = formatTradesForTradeChart(props.trades, 10) as any

    return (context[0].members && <ResponsiveChord
        data={data}
        keys={getChordKeys(context[0].members)}
        margin={{ bottom: 90}}
        valueFormat=".2f"
        padAngle={0.02}
        enableLabel={false}
        innerRadiusRatio={0.96}
        innerRadiusOffset={0.02}
        inactiveArcOpacity={0.25}
        arcBorderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    0.6
                ]
            ]
        }}
        activeRibbonOpacity={0.75}
        inactiveRibbonOpacity={0.25}
        ribbonBorderColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    0.6
                ]
            ]
        }}
        labelRotation={-90}
        labelTextColor={{
            from: 'color',
            modifiers: [
                [
                    'darker',
                    1
                ]
            ]
        }}
        colors={{ scheme: 'nivo' }}
        motionConfig="stiff"
        legends={[
            {
                anchor: 'left',
                direction: 'column',
                justify: false,
                translateX: 0,
                translateY: 70,
                itemWidth: 80,
                itemHeight: 14,
                itemsSpacing: 0,
                itemTextColor: '#999',
                itemDirection: 'left-to-right',
                symbolSize: 12,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#000'
                        }
                    }
                ]
            }
        ]}
    />)
}


    function formatTradesForTradeChart(trades: SleeperTransaction[], leagueSize: number) {
        let data: number[][] = []
        let memberTradeMap: Map<number, Map<number, number>> = new Map()
        for (let i = 1; i <= leagueSize; i++) {
            memberTradeMap.set(i, new Map())
        }
        
        memberTradeMap.forEach((map, key) => {
            for (let i = 1; i <= leagueSize; i++) {
                map.set(i, 0)
            }
        })

        trades.forEach(trade => {
            trade.consenter_ids.forEach(id => {
                trade.consenter_ids.forEach(subId => {
                    if (subId != id) {
                        let existingTrades = memberTradeMap.get(id)?.get(subId)
                        memberTradeMap.get(id)?.set(subId, existingTrades as any + 1)
                    }
                })
                
            })
        })

        memberTradeMap.forEach((tradeMap: Map<number, number>, rosterId: number) => {
            let teamTrades: number[] = []
            tradeMap.forEach((numTrades: number, id) => {
                teamTrades.push(numTrades)
            })
            data.push(teamTrades)
          });
        return data 
    }

    function getChordKeys(members: Map<number, LeagueMember>) {
        let keys: string[] = []
        for(let i = 1; i <= members.size; i++) {
            keys.push(members.get(i)?.name as string)
        }

        return keys

    }

    const ArcTooltip = ({ arc }: ArcTooltipComponentProps) => (
        <BasicTooltip
            id={`Custom arc tooltip, ${arc.label}`}
            value={arc.formattedValue}
            color={arc.color}
            enableChip={true}
        />
    )
    
    const RibbonTooltip = ({ ribbon }: RibbonTooltipComponentProps) => (
        <TableTooltip
            rows={[
                [
                    <Chip key="chip" color={ribbon.source.color} />,
                    'Source (custom)',
                    <strong key="id">{ribbon.source.id}</strong>,
                    ribbon.source.value,
                ],
                [
                    <Chip key="chip" color={ribbon.target.color} />,
                    'Target (custom)',
                    <strong key="id">{ribbon.target.id}</strong>,
                    ribbon.target.value,
                ],
            ]}
        />
    )

export default TradeChordChart