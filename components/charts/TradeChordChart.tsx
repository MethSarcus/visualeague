import { Box } from '@chakra-ui/react';
import { ArcTooltipComponentProps, ResponsiveChord, RibbonTooltipComponentProps } from '@nivo/chord';
import { BasicTooltip, Chip, TableTooltip } from '@nivo/tooltip';
import { useContext, useMemo } from 'react';
import LeagueMember from '../../classes/custom/LeagueMember';
import { SleeperTransaction } from '../../classes/sleeper/SleeperTransaction';
import { LeagueContext } from '../../contexts/LeagueContext';


interface MyProps {
    trades: SleeperTransaction[]
}


const TradeChordChart = (props: MyProps) => {
    const [context] = useContext(LeagueContext)
    const members = context?.members as Map<number, LeagueMember> | undefined
    const data = useMemo(
        () => formatTradesForTradeChart(props.trades, members?.size ?? 0),
        [props.trades, members]
    )
    const keys = useMemo(() => getChordKeys(members), [members])

    if (!members) return <Box>Loading...</Box>
    if (props.trades.length === 0) return <Box>No trades yet</Box>

    return (<ResponsiveChord
        data={data}
        keys={keys}
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
        arcTooltip={ArcTooltip}
        ribbonTooltip={RibbonTooltip}
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
        role='application'
        ariaLabel='Trades between league members'
    />)
}


function formatTradesForTradeChart(trades: SleeperTransaction[], leagueSize: number) {
    let data: number[][] = []
    let memberTradeMap: Map<number, Map<number, number>> = new Map()
    for (let i = 1; i <= leagueSize; i++) {
        memberTradeMap.set(i, new Map())
    }

    memberTradeMap.forEach((map) => {
        for (let i = 1; i <= leagueSize; i++) {
            map.set(i, 0)
        }
    })

    trades.forEach(trade => {
        trade.consenter_ids.forEach(id => {
            trade.consenter_ids.forEach(subId => {
                if (subId != id) {
                    let existingTrades = memberTradeMap.get(id)?.get(subId) ?? 0
                    memberTradeMap.get(id)?.set(subId, existingTrades + 1)
                }
            })

        })
    })

    memberTradeMap.forEach((tradeMap: Map<number, number>) => {
        let teamTrades: number[] = []
        tradeMap.forEach((numTrades: number) => {
            teamTrades.push(numTrades)
        })
        data.push(teamTrades)
    });
    return data
}

function getChordKeys(members?: Map<number, LeagueMember>) {
    let keys: string[] = []
    if (!members) return keys
    for (let i = 1; i <= members.size; i++) {
        keys.push(members.get(i)?.name ?? `Team ${i}`)
    }

    return keys
}

const ArcTooltip = ({ arc }: ArcTooltipComponentProps) => (
    <BasicTooltip
        id={arc.label}
        value={arc.formattedValue}
        color={arc.color}
        enableChip={true}
    />
)

const RibbonTooltip = ({ ribbon }: RibbonTooltipComponentProps) => (
    <TableTooltip
        rows={[
            [
                <Chip key="source-chip" color={ribbon.source.color} />,
                'Source',
                <strong key="source-id">{ribbon.source.id}</strong>,
                ribbon.source.value,
            ],
            [
                <Chip key="target-chip" color={ribbon.target.color} />,
                'Target',
                <strong key="target-id">{ribbon.target.id}</strong>,
                ribbon.target.value,
            ],
        ]}
    />
)

export default TradeChordChart
