// Edit selection.
//
// 'full'  - the complete story exactly as written (default).
// 'tight' - drops a handful of narration lines whose information is already
//           carried by the picture, for a shorter YouTube cut. No dialogue, no
//           reveal and no story beat is removed.
//
// Switch with:  REMOTION_EDIT=tight npm run start   (or edit the default below)
export type EditMode = 'full' | 'tight';

const fromEnv = typeof process !== 'undefined' ? process.env?.REMOTION_EDIT : undefined;
export const EDIT_MODE: EditMode = fromEnv === 'tight' ? 'tight' : 'full';

export const TRIM_IN_TIGHT_EDIT = new Set<string>([
	'narrator_007_nobody_boarded',
	'narrator_028_weather',
	'narrator_031_tired',
	'emma_001_wake_me',
	'daniel_001_go_sleep',
	'narrator_033_nothing_unusual',
	'narrator_038_frowned',
	'narrator_039_sixty_three_b',
	'narrator_048_approached',
	'narrator_049_daniel',
	'narrator_050_looking',
	'narrator_061_laughed',
	'narrator_062_wasnt',
	'narrator_064_knew',
	'narrator_077_bathrooms',
	'narrator_086_not_physically',
	'narrator_094_identification',
	'narrator_095_license',
	'narrator_108_captain_crew',
	'narrator_130_windshield',
	'narrator_137_another_pause',
	'narrator_141_radio_error',
	'narrator_149_same_crew',
	'narrator_159_not_announcement',
	'narrator_207_told',
	'narrator_208_list',
	'narrator_220_uncomfortable',
	'narrator_234_replaced',
	'narrator_235_refused',
	'narrator_240_almost_deleted',
	'narrator_244_same_clothes',
]);
