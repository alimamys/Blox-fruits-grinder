// Limited MS Paint palette: black, dark navy, gray, white, blue, red, yellow, brown.

export const C = {
	ink: '#111014',
	black: '#000000',
	white: '#f4f2ec',
	paper: '#fbfaf6',

	// night apartment
	night: '#070b1f',
	navy: '#121a3f',
	navyWall: '#1a2350',
	navyLight: '#26326b',
	floor: '#2a2034',
	floorLine: '#1b1424',

	gray: '#7c7f8a',
	grayDark: '#3d4049',
	grayLight: '#b8bcc6',

	skin: '#f6eee4', // Adam's pale round face
	skinShade: '#e2d6c6',
	victorSkin: '#e4e7e1', // paler, grayer
	blue: '#2f6ce0', // Adam's shirt
	blueDark: '#1d47a3',
	pants: '#22252e',
	hair: '#16141a',

	red: '#d7262b',
	redDark: '#8f1418',
	maroon: '#6b1a24',
	yellow: '#f9d13b',
	lamp: '#ffd859',
	lampGlow: 'rgba(255, 210, 90, 0.22)',
	brown: '#7a4a28',
	brownDark: '#4d2d17',
	wood: '#9a6233',
	green: '#3e8e4a',

	// radio
	radioBody: '#1b1b1f',
	radioRim: '#41424d',
	radioGlow: '#ff6a1c',
	radioGlowHot: '#ffb347',
	radioDisplayOff: '#2a0e05',
	tune: '#c9ff3a',

	// motel
	motelWall: '#8d7a3c',
	motelWallDark: '#5e5126',
	motelFloor: '#4a3a22',
	motelLight: 'rgba(214, 190, 92, 0.25)',
	motelNight: '#0d1a3a',

	// CCTV
	cctvTint: '#9fb3a2',

	// documents
	agedPaper: '#e7dcc0',
	agedPaperDark: '#cdbd98',
	printInk: '#1d1a16',
};

export const ADAM_LOOK = {
	shirt: C.blue,
	pants: C.pants,
	skin: C.skin,
	hair: 'short' as const,
	hairColor: C.hair,
};
