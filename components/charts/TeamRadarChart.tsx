import { Spinner, useMediaQuery } from '@chakra-ui/react';
import { ResponsiveRadar } from '@nivo/radar';
import { useMemo } from 'react';
import League from '../../classes/custom/League';
import LeagueMember from '../../classes/custom/LeagueMember';
import { POSITION } from '../../utility/rosterFunctions';

interface MyProps {
    league: League | undefined
}

interface RadarLegend {
    anchor: 'right' | 'bottom'
    direction: 'column' | 'row'
    translateX: number
    translateY: number
    itemWidth: number
    toggleSerie: boolean
    itemHeight: number
    itemTextColor: string
    symbolSize: number
    symbolShape: 'circle'
    effects: {on: 'hover'; style: {itemTextColor: string}}[]
}

const theme = {
    "background": "none",
    "textColor": "white"
}

const TeamRadarChart = (props: MyProps) => {
    const [isLargerThan800] = useMediaQuery('(min-width: 800px)', {
        ssr: true,
        fallback: false, // return false on the server, and re-evaluate on the client side
      })

    const marginVals = isLargerThan800
        ? { top: 50, right: 100, bottom: 75, left: 0 }
        : { top: 0, right: 25, bottom: 75, left: 25 }
    const legendDirection: RadarLegend['direction'] = isLargerThan800 ? 'column' : 'row'
    const legendAnchor: RadarLegend['anchor'] = isLargerThan800 ? 'right' : 'bottom'

    const legendsArr: RadarLegend[] = isLargerThan800
        ? [
            {
                anchor: legendAnchor,
                direction: legendDirection,
                translateX: -20,
                translateY: -40,
                itemWidth: 80,
                toggleSerie: true,
                itemHeight: 20,
                itemTextColor: '#999',
                symbolSize: 12,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemTextColor: '#FFFFFF'
                        }
                    }
                ]
            }
        ]
        : []

    const league = props.league
    const data = useMemo(() => {
        if (league?.settings == undefined) return undefined
        return formatScoresForRadarChart(Array.from(league.members.values()), league.getPositions())
    }, [league])

    if (data == undefined) return <Spinner/>

    return (
    <ResponsiveRadar
        data={data.chartData}
        keys={data.keys}
        theme={theme}
        indexBy="position"
        valueFormat=">-.2f"
        margin={marginVals}
        borderColor={{ from: 'color' }}
        gridLabelOffset={20}
        dotSize={10}
        dotColor={{ theme: 'background' }}
        dotBorderWidth={2}
        colors={{ scheme: 'nivo' }}
        blendMode="multiply"
        motionConfig="wobbly"
        legends={legendsArr}
        role="application"
        ariaLabel="Positional scoring breakdown by team"
    />)
}


function formatScoresForRadarChart(members: LeagueMember[] | undefined, positions: POSITION[] | undefined) {
    const data: Record<string, string | number>[] = []
    const keys: string[] = []

    members?.forEach((member: LeagueMember) => {keys.push(member.name)})

    positions?.forEach((position) => {
        const positionObj: Record<string, string | number> = {position: position}
        members?.forEach((member: LeagueMember) => {
            const positionScore = member.stats.position_scores.get(position)
            const positionStarts = member.stats.position_starts.get(position)
            if (position != undefined && positionScore != undefined && positionStarts) {
                const positionAverage = positionScore / positionStarts
                positionObj[member.name] = parseFloat(positionAverage.toFixed(2))
            }
        })
        data.push(positionObj)
    })

    return {chartData: data, keys: keys}
}

export default TeamRadarChart
