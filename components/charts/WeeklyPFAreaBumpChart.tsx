import { Spinner } from '@chakra-ui/react';
import { ResponsiveAreaBump } from '@nivo/bump';
import League from '../../classes/custom/League';
import LeagueMember from '../../classes/custom/LeagueMember';
import { project_colors } from '../../utility/rosterFunctions';


interface MyProps {
    league: League
}

const AreaBumpChart = (props: MyProps) => {
    let data = formatScoresForBumpChart(props.league) as any
    const theme = {
        "background": project_colors.surface[1],
        "textColor": "white"
    }

    if (data.length <= 0) return <Spinner/>

    return (<ResponsiveAreaBump
        data={data}
        theme={theme}
        margin={{ top: 40, right: 100, bottom: 40, left: 100 }}
        spacing={6}
        colors={{ scheme: 'nivo' }}
        blendMode="multiply"
        startLabel={"id" as any}
        endLabel={"id" as any}
        // interpolation='linear'
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
                        y: team.score
                    })
                } else {
                    memberPowerRankMap.set(team.id, [{
                        x: week.weekNumber,
                        y: team.score
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

export default AreaBumpChart