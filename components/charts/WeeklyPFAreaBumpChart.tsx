import { Spinner } from '@chakra-ui/react';
import { ResponsiveAreaBump } from '@nivo/bump';
import { useMemo } from 'react';
import League from '../../classes/custom/League';
import LeagueMember from '../../classes/custom/LeagueMember';
import { project_colors } from "../../utility/project_colors";

interface BumpSeries {
    id: string
    data: {x: number; y: number}[]
    [key: string]: unknown
}

interface MyProps {
    league: League
}

const theme = {
    "background": project_colors.surface[1],
    "textColor": "white"
}

const AreaBumpChart = (props: MyProps) => {
    const data = useMemo(() => formatScoresForBumpChart(props.league), [props.league])

    if (data.length <= 0) return <Spinner/>

    return (<ResponsiveAreaBump
        data={data}
        theme={theme}
        margin={{ top: 40, right: 100, bottom: 40, left: 100 }}
        spacing={6}
        colors={{ scheme: 'nivo' }}
        blendMode="multiply"
        startLabel={(serie) => serie.id}
        endLabel={(serie) => serie.id}
        xPadding={.5}
        axisTop={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Week',
            legendPosition: 'middle',
            legendOffset: -36
        }}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: '',
            legendPosition: 'middle',
            legendOffset: 32
        }}
        role='application'
    />)
}


function formatScoresForBumpChart(league: League): BumpSeries[] {
    const data: BumpSeries[] = []
    const memberPowerRankMap: Map<number, {x: number; y: number}[]> = new Map()

    league.weeks.forEach((week) => {
        week.getAllScores().forEach(team => {
            if (team.score == undefined) return
            const existing = memberPowerRankMap.get(team.id)
            const point = {x: week.weekNumber, y: team.score}
            if (existing) {
                existing.push(point)
            } else {
                memberPowerRankMap.set(team.id, [point])
            }
        })
    })

    league.members.forEach((member: LeagueMember) => {
        const rosterId = league.memberIdToRosterId.get(member.userId)
        const series = rosterId != undefined ? memberPowerRankMap.get(rosterId) : undefined
        if (series) {
            data.push({
                id: member.name,
                data: series,
            })
        }
    })

    return data
}

export default AreaBumpChart
