export const project_colors = {
	textTheme: {
		highEmphasis: '#E0E0E0',
		mediumEmphasis: '#A0A0A0',
		disabled: '#6C6C6C',
	},
	primary: {
		50: '#f4ebfe',
		100: '#e2cdfd',
		200: '#cfabfd',
		300: '#bb86fc',
		400: '#aa67f9',
		500: '#994af1',
		600: '#8e44ea',
		700: '#803be0',
		800: '#7335d8',
		900: '#5f27ca',
	},
	secondary: {
		50: '#d4f6f2',
		100: '#92e9dc',
		200: '#03dac4',
		300: '#00c7ab',
		400: '#00b798',
		500: '#00a885',
		600: '#009a77',
		700: '#008966',
		800: '#007957',
		900: '#005b39',
	},
	surface: {
		0: 'rgb(37, 37, 37)',
		1: 'rgb(56, 56, 56)',
		2: 'rgb(75, 75, 75)',
		3: 'rgb(94, 94, 94)',
		4: 'rgb(113, 113, 113)',
		5: 'rgb(132, 132, 132)',
		6: 'rgb(5, 5, 5)',
		7: 'rgb(151, 151, 151)',
		8: 'rgb(189, 189, 189)',
		9: 'rgb(208, 208, 208)',
		10: 'rgb(226, 226, 226)',
	},
	statColor: {
		good: 'rgb(121,229,172, 1)',
		bad: 'rgb(234,67,111, 1)',
		neutral: 'rgb(56, 56, 56)',
	},
	position: {
		QB: 'rgba(239, 116, 161, 0.8)',
		RB: 'rgba(143, 242, 202, 0.8)',
		WR: 'rgba(86, 201, 248, 0.8)',
		TE: 'rgba(254, 174, 88, 0.8)',
		DL: 'rgba(250, 153, 97, 0.8)',
		DB: 'rgba(254, 160, 202, 0.8)',
		LB: 'rgba(174, 182, 252, 0.8)',
		K: '#7988a1',
		DEF: '#bd66ff',
		BN: '#A7BAD0',
	},
	sleeper: {
		light_card: '#43495A',
		background_dark: '#1A202E',
		text_normal: '#FBFBFB',
		text_grey: '#A7BAD0',
		text_dark: '#96A2B6',
		badge_background: '#42495B',
		border_color: '#2F3241',
		dark_component_background: "rgb(32, 38, 53)",
		horizontal_pill_group: {
			background: "rgb(32, 38, 53)",
			text_selected_color: "rgb(2, 32, 71)",
			selected_item_background: 'rgb(199 213 228)',
			text_color: 'rgb(185, 196, 212)'
		}
	},
	outcomeColor: {
		win: 'rgb(121,229,172, 1)',
		loss: 'rgb(234,67,111, 1)',
		badge_win: 'rgb(121,190,172, 1)',
		tie_color: '#BC14A5',
		tie_gradient: 'linear(to-l, #7928CA, #FF0080)',
		tie_green: '#FF0080',
		tie_red: '#7928CA',
	},
}

export function lerp(colors: number[][], value: number) {
	return [
		colors[0][0] + (colors[1][0] - colors[0][0]) * value,
		colors[0][1] + (colors[1][1] - colors[0][1]) * value,
		colors[0][2] + (colors[1][2] - colors[0][2]) * value,
	]
}

export function redGreenLerp(value: number) {
	let colors = [
		[1.0, 0, 0],
		[0, 0, 1],
	]
	return [
		colors[0][0] + (colors[1][0] - colors[0][0]) * value,
		colors[0][1] + (colors[1][1] - colors[0][1]) * value,
		colors[0][2] + (colors[1][2] - colors[0][2]) * value,
	]
}

export function hexColorToFloatColor(hex: string) {
	return [
		parseInt(hex.substring(0, 2), 16) / 255,
		parseInt(hex.substring(2, 4), 16) / 255,
		parseInt(hex.substring(4, 6), 16) / 255,
	]
}
