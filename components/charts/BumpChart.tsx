import { Spinner } from '@chakra-ui/react';
import { ResponsiveBump } from '@nivo/bump';
import League from '../../classes/custom/League';
import LeagueMember from '../../classes/custom/LeagueMember';
import { project_colors } from '../../utility/rosterFunctions';


interface MyProps {
    league: League
}

const BumpChart = (props: MyProps) => {
    let data = formatScoresForBumpChart(props.league) as any
    const theme = {
        "background": project_colors.surface[1],
        "textColor": "white"
    }

    if (data.length <= 0) return <Spinner/>

    return (<ResponsiveBump
        data={data}
        colors={{ scheme: 'spectral' }}
        theme={theme}
        lineWidth={3}
        activeLineWidth={6}
        inactiveLineWidth={3}
        inactiveOpacity={0.15}
        pointSize={10}
        activePointSize={16}
        inactivePointSize={0}
        pointColor={{ theme: 'background' }}
        pointBorderWidth={3}
        activePointBorderWidth={3}
        pointBorderColor={{ from: 'serie.color' }}
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
            legendOffset: 0
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'ranking',
            legendPosition: 'middle',
            legendOffset: -40
        }}
        margin={{ top: 40, right: 200, bottom: 60, left: 60 }}
        axisRight={null}
    />)
}


    function formatScoresForBumpChart(league: League) {
        let data: object[] = []
        let memberPowerRankMap: Map<number, object[]> = new Map()

        league.weeks.forEach((week) => {
            week.getAllScores().forEach(team => {
                if (memberPowerRankMap.has(team.id)) {
                    (memberPowerRankMap.get(team.id) as object[]).push({
                        x: week.weekNumber,
                        y: team.rank
                    })
                } else {
                    memberPowerRankMap.set(team.id, [{
                        x: week.weekNumber,
                        y: team.rank
                    }])
                }
            }) 
        })

        league.members.forEach((member: LeagueMember) => {
            if (league.memberIdToRosterId.has(member.userId)) {
                data.push({
                    id: member.name,
                    data: memberPowerRankMap.get(league.memberIdToRosterId.get(member.userId) as number)
                })
            }
        })

        return data
    }

export default BumpChart