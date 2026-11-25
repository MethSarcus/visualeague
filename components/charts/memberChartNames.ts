import LeagueMember from '../../classes/custom/LeagueMember'

export function memberChartNames(members: LeagueMember[]) {
	const counts = new Map<string, number>()
	members.forEach((member) => counts.set(member.name, (counts.get(member.name) ?? 0) + 1))
	return new Map(members.map((member) => [
		String(member.roster.roster_id),
		(counts.get(member.name) ?? 0) > 1 ? `${member.name} (${member.teamName})` : member.name,
	]))
}
