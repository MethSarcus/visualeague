export function formatHistoryRecord(record: {wins: number; losses: number; ties: number}, showTies: boolean, separator = '–') {
	return [record.wins, record.losses, ...(showTies ? [record.ties] : [])].join(separator)
}

export function describeHistoryRecord(record: {wins: number; losses: number; ties: number}, showTies: boolean) {
	return `${record.wins} wins, ${record.losses} losses${showTies ? `, ${record.ties} ties` : ''}`
}
