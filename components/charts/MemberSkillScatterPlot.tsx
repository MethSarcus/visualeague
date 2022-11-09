import { Spinner } from '@chakra-ui/react';
import { ResponsiveScatterPlot } from '@nivo/scatterplot';
import League from '../../classes/custom/League';
import LeagueMember from '../../classes/custom/LeagueMember';
import { project_colors } from '../../utility/rosterFunctions';


interface MyProps {
    league: League
}

const MemberSkillScatterPlot = (props: MyProps) => {
    let data = formatScoresForScatterPlot(props.league) as any
    const theme = {
        "background": project_colors.surface[1],
        "textColor": "white"
    }

    if (data.length <= 0) return <Spinner/>

    return (   <ResponsiveScatterPlot
        data={data}
        theme={theme}
        margin={{ top: 60, right: 140, bottom: 70, left: 90 }}
        xScale={{ type: 'linear', min: "auto", max: 'auto' }}
        xFormat=" >-.2f"
        yScale={{ type: 'linear', min: "auto", max: 'auto' }}
        yFormat=">-.2f"
        blendMode="multiply"
        nodeSize={14}
        axisTop={null}
        axisRight={null}
        axisBottom={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Gut Points',
            legendPosition: 'middle',
            legendOffset: 46
        }}
        axisLeft={{
            tickSize: 5,
            tickPadding: 5,
            tickRotation: 0,
            legend: 'Potential Points',
            legendPosition: 'middle',
            legendOffset: -60
        }}
        legends={[
            {
                anchor: 'bottom-right',
                direction: 'column',
                justify: false,
                translateX: 130,
                translateY: 0,
                itemWidth: 100,
                itemHeight: 12,
                itemsSpacing: 5,
                itemDirection: 'left-to-right',
                symbolSize: 12,
                symbolShape: 'circle',
                effects: [
                    {
                        on: 'hover',
                        style: {
                            itemOpacity: 1
                        }
                    }
                ]
            }
        ]}
    />)
}


    function formatScoresForScatterPlot(league: League) {
        let data: object[] = []
        let memberSkillsMap: Map<number, object[]> = new Map()

        league.weeks.forEach((week) => {
            week.getAllScores().forEach(team => {
                if (memberSkillsMap.has(team.id)) {
                    (memberSkillsMap.get(team.id) as object[]).push({
                        x: team.gp,
                        y: team.pp,
                        week: week.weekNumber
                    })
                } else {
                    memberSkillsMap.set(team.id, [{
                        x: team.gp,
                        y: team.pp,
                        week: week.weekNumber
                    }])
                }
            }) 
        })

        league.members.forEach((member: LeagueMember) => {
            if (league.memberIdToRosterId.has(member.userId)) {
                data.push({
                    id: member.name,
                    data: memberSkillsMap.get(league.memberIdToRosterId.get(member.userId) as number)
                })
            }
        })

        return data
    }

export default MemberSkillScatterPlot