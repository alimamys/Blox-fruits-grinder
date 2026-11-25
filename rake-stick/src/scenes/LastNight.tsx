// 8. THE THIRD NIGHT, AGAIN - "he came closer last night"; tonight is the third night; Lily puts Sam in her bed and
// lies down in his. 4:00. The blanket moves. It climbs up from the end of the bed - knees, hands, closer - and she
// doesn't hide this time. Face to face: "Lily..." Then nothing.
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {LilyAdult} from '../components/characters/Cast';
import {LieInBed} from '../stick/bed';
import {GEO, lerp, ramp, shot, Shots, ui, useStick, type Shot} from '../stick/kit';
import {BedClock, Glow} from '../stick/props';
import {Rake} from '../stick/rake';
import {Kitchen} from './common';
import {SamAsleep} from './Today';

const SB = GEO.son;
const ON = SB.quilt - 30; // where it crouches on the blanket

export const LastNight: React.FC = () => {
	const {f, t, at, end, word, talk} = useStick();
	const T = (id: string, k = 0) => at(id) + k * (end(id) - at(id));
	const tPut = word('son_003_closer', 'put', 0.5) - 0.15;
	const tClock = at('clock');
	const tFlip = tClock + 1.3;
	const t48 = T('narrator_048_blanket');
	const t49 = T('narrator_049_climbed');
	const t50 = T('narrator_050_looked');
	const shots: Shot[] = [
		// SAM: "Mom... he came closer last night."
		shot(T('son_003_closer'), 'kitchen2_day', 2.5, 2.6, [1230, 690], [1230, 690], {tag: 'sam'}),
		// "He put his hand on my knee." - the second visit
		shot(tPut, 'sonroom_night', 1.6, 1.8, [600, 640], [620, 640], {tag: 'knee'}),
		// "Tonight is the third night." - his bed, empty
		shot(T('narrator_046_third'), 'sonroom_night', 1.0, 1.08, [960, 540], [900, 560], {tag: 'empty'}),
		// "I put Sam in my bed. Then I walked down the hall, and lay down in his."
		shot(T('narrator_047_lay_down'), 'sonroom_night', 1.15, 1.6, [760, 600], [470, 640], {tag: 'her'}),
		// 3:59 -> 4:00
		shot(tClock, 'sonroom_night', 3.6, 3.7, [130, 760], [130, 760], {tag: 'her'}),
		shot(tClock + 1.6, 'sonroom_night', 2.9, 3.0, [290, 650], [290, 650], {tag: 'her'}),
		// "At four o'clock, the blanket moved."
		shot(t48, 'sonroom_night', 1.5, 1.6, [880, 690], [900, 690], {tag: 'climb'}),
		// "Something climbed up from the end of the bed. Slowly. Knees. Hands. Closer."
		shot(t49, 'sonroom_night', 1.3, 1.65, [780, 620], [560, 630], {tag: 'climb'}),
		// "This time, I didn't hide. I looked right at it."
		shot(t50, 'sonroom_night', 2.3, 2.6, [420, 610], [360, 615], {tag: 'climb'}),
		// face to face; its mouth opens
		shot(at('face'), 'sonroom_night', 2.8, 3.15, [330, 615], [320, 612], {tag: 'climb'}),
		// "Lily..."
		shot(T('rake_002_lily'), 'sonroom_night', 3.25, 3.4, [320, 612], [320, 612], {tag: 'climb', shake: 1.2}),
		// then nothing
		ui(at('black'), () => <AbsoluteFill style={{background: '#000'}} />),
	];
	const world = (s: Shot) => {
		if (s.set === 'kitchen2_day') {
			const sd = talk('son');
			return <Kitchen f={f} left="adult" right="son" l={{look: [1, 0], eyes: 'wide', brows: 'worried', mouth: 'flat', idle: false}} r={{talk: sd.talk, viseme: sd.viseme, look: [-1, 0.1], eyes: 'wide', brows: 'worried', mouth: 'frown', tears: 0.7}} />;
		}
		if (s.tag === 'knee')
			return (
				<g>
					<SamAsleep f={f} clock="4:00" />
					<Rake x={700} y={ON} s={1.35} frame={f} pose="side" dir={-1} lean={0.45} />
				</g>
			);
		const clockText = t < tFlip ? '3:59' : '4:00';
		const moon = <Glow cx={720} cy={300} r={460} color="#a9d2e6" k={0.3} />;
		const clock = <BedClock x={GEO.sonRoom.clock[0]} y={GEO.sonRoom.clock[1]} text={s.tag === 'empty' ? '11:52' : clockText} frame={f} />;
		if (s.tag === 'empty') return <g>{moon}{clock}</g>;
		// Lily in his bed, eyes open; once it is on the bed she watches it come
		const coming = t > t49;
		const close = t > t50;
		const lilyP = {eyes: 'wide', brows: close ? 'angry' : 'worried', mouth: t > at('face') ? 'o' : 'flat', look: coming ? [1, -0.4] : [0.6, -0.8], idle: t < t48};
		// the blanket at her feet presses down and moves
		const press = s.tag === 'climb' && t < t49 + 0.5 ? Math.sin((t - t48) * 7) * 5 * ramp(t, t48 + 0.3, t48 + 0.8) : 0;
		const her = <LieInBed b={SB} is={LilyAdult} px={262} s={1.15} frame={f} id="lily" wob={press} p={lilyP} />;
		if (s.tag !== 'climb') return <g>{moon}{clock}{her}</g>;
		// it rises at the foot of the bed, climbs on, and crawls up the length of the bed to her face
		const rise = ramp(t, T('narrator_048_blanket', 0.55), T('narrator_049_climbed', 0.12));
		const go = ramp(t, T('narrator_049_climbed', 0.12), T('narrator_050_looked', 0.2));
		const x = lerp(1170, 580, go);
		const y = ON + (1 - rise) * 260;
		const dip = ramp(t, T('narrator_050_looked', 0.1), at('face') + 0.6);
		const rt = talk('rake');
		const mouth = Math.max(rt.talk * 0.9, ramp(t, at('face') + 0.2, at('face') + 1.4) * 0.45);
		return (
			<g>
				{moon}
				{clock}
				{her}
				<defs>
					<clipPath id="lastRise">
						<rect x={0} y={0} width={1920} height={SB.quilt + 12} />
					</clipPath>
				</defs>
				<g clipPath={rise < 1 ? 'url(#lastRise)' : undefined}>
					<g transform={`rotate(${-24 * dip} ${x + 40} ${ON})`}>
						<Rake x={x} y={y} s={1.35} frame={f} pose="side" dir={-1} lean={0.3 + 0.7 * dip} mouth={mouth} crawl={go > 0 && go < 1 ? go * 3 : undefined} qa={false} />
					</g>
				</g>
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s)} />;
};
