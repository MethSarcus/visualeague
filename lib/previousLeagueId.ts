export function previousLeagueId(id: string | null | undefined): string | null {
	return id && id !== '0' ? id : null
}
