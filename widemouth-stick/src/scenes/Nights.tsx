// 6. THE NIGHTS - the grin at the edge of the mattress, whispering until dawn; then waking up cold on the
// sill of the empty room, the window wide open. "Almost."
import React from 'react';
import {Eli} from '../components/characters/Cast';
import {Widemouth} from '../components/characters/Widemouth';
import {BEDS, GEO, hallScale, INK, lerp, ramp, Sash, shot, Shots, Tint, useStick} from '../stick/kit';
import {BedScene, EmptyBed, KID_S, WM_S} from '../stick/rooms';

const bn = BEDS.bedroom_night;

export const Nights: React.FC = () => {
	const {f, t, at, end, word, talk} = useStick();
	const t49 = at('narrator_049_woke_me');
	const tWoke = word('narrator_049_woke_me', 'woke', 0.4);
	const t50 = at('narrator_050_grin');
	const w10 = at('widemouth_010_real_trampoline');
	const t51 = at('narrator_051_squeeze');
	const t52 = at('narrator_052_didnt_leave');
	const t53 = at('narrator_053_until_grey');
	const t54 = at('narrator_054_not_fun');
	const tNR = at('night_room');
	const t55 = at('narrator_055_woke_cold');
	const t56 = at('narrator_056_not_in_bed');
	const t57 = at('narrator_057_sill');
	const tToes = word('narrator_057_sill', 'toes', 0.7);
	const t58 = at('narrator_058_dont_know');
	const t59 = at('narrator_059_whispered');
	const w11 = at('widemouth_011_almost');
	const t60 = at('narrator_060_ran_back');
	const tBed = word('narrator_060_ran_back', 'pulled', 0.35);
	const wmT = talk('widemouth');

	const er = GEO.emptyroom;
	const sillX = (er.opening[0] + er.opening[2]) / 2;
	const wmBedX = bn.pillow[1] + 70;
	const wmBedY = bn.quilt + 30;
	const fakeWhisper = t >= t52 && t < end('narrator_053_until_grey') ? Math.max(0, Math.sin(t * 11)) * 0.35 : 0;
	const dawn = ramp(t, t53 + 0.5, end('narrator_053_until_grey'));
	const cornerX = 330;
	const shots = [
		shot(t49, 'bedroom_night', 1.5, 1.6, [520, 560], [500, 560]),
		shot(t50, 'bedroom_night', 2.5, 2.8, [430, 560], [440, 560]),
		shot(w10, 'bedroom_night', 3.0, 3.3, [wmBedX - 20, wmBedY - 130], [wmBedX - 20, wmBedY - 125]),
		shot(t51, 'bedroom_night', 3.0, 3.2, [330, 560]),
		shot(t52, 'bedroom_night', 1.6, 1.7, [520, 580]),
		shot(t53, 'bedroom_night', 1.0, 1.04, [900, 560]),
		shot(t54, 'bedroom_night', 2.2, 2.3, [370, 560], [370, 560], {light: 'dawn'}),
		shot(tNR, 'bedroom_night', 1.0, 1.05, [960, 540]),
		shot(t55, 'black', 1.0, 1.0, [960, 540]),
		shot(t56, 'bedroom_night', 1.1, 1.15, [600, 600]),
		shot(t57, 'emptyroom', 1.0, 1.35, [960, 560], [sillX, 520], {light: 'dark'}),
		shot(tToes - 0.2, 'window_down', 1.0, 1.1, [960, 640], [960, 660], {light: 'dark'}),
		shot(t58, 'emptyroom', 1.5, 1.6, [sillX, 560], [sillX, 560], {light: 'dark'}),
		shot(t59, 'emptyroom', 1.3, 1.4, [700, 620], [600, 640], {light: 'dark'}),
		shot(w11 - 0.2, 'emptyroom', 3.2, 3.6, [cornerX, er.ground - 120], [cornerX, er.ground - 115], {light: 'dark'}),
		shot(t60, 'emptyroom', 1.0, 1.0, [960, 540], [960, 540], {light: 'dark'}),
		shot(t60 + 1.3, 'hallway', 1.0, 1.0, [960, 560], [960, 560], {light: 'dark'}),
		shot(tBed - 0.1, 'bedroom_night', 1.4, 1.5, [560, 560]),
	];

	const world = (set: string) => {
		if (set === 'black') {
			const open = ramp(t, t55 + 0.6, t55 + 1.0);
			return (
				<g>
					<rect width={1920} height={1080} fill="#05070c" />
					<g opacity={0.9}>
						<Tint light="dark">
							<Eli x={960} y={1240} s={4.2} frame={f} eyes={open > 0.5 ? 'wide' : 'closed'} brows="worried" mouth="o" pale={0.35} look={[0, 0.2]} />
						</Tint>
					</g>
				</g>
			);
		}
		if (set === 'bedroom_night') {
			if (t >= t56 && t < t57) {
				return (
					<g>
						<EmptyBed b={bn} light="night" id="ne" />
					</g>
				);
			}
			if (t >= t60) return <BedScene set="bedroom_night" light="night" frame={f} bed={{mode: 'hide', shiver: 1}} id="nh" />;
			const wmOn = t >= t50 && t < end('narrator_053_until_grey') - 0.3;
			const eyesOpen = t > tWoke && !(t >= t51 && t < t54);
			const sleep = t >= tNR;
			return (
				<g>
					<BedScene
						set="bedroom_night"
						light={t >= t54 && t < tNR ? 'dawn' : 'night'}
						frame={f}
						id="nb"
						bed={{mode: 'lie', p: {eyes: sleep ? 'closed' : eyesOpen ? 'wide' : 'closed', brows: t > tWoke && !sleep ? 'worried' : 'none', look: [1, 0.1], mouth: 'flat', pale: t >= t54 && t < tNR ? 0.3 : 0}}}
						front={wmOn ? (
							<g>
								<Tint light="night">
									<Widemouth x={wmBedX} y={wmBedY} s={WM_S} frame={f} mouth="grin" talk={wmT.talk + fakeWhisper} flip look={[1, 0.3]} glow />
								</Tint>
							</g>
						) : null}
					/>
					{dawn > 0 && t < tNR ? <rect width={1920} height={1080} fill="#7d8aa6" opacity={dawn * 0.45} style={{mixBlendMode: 'screen'}} /> : null}
				</g>
			);
		}
		if (set === 'window_down') {
			// his bare toes over the edge of the sill, the drop below in the dark
			return (
				<Tint light="dark">
					{[-1, 1].map((sg) => (
						<g key={sg} transform={`translate(${960 + sg * 120} 930) scale(1.7)`}>
							<path d="M-38,80 L-34,0 C-30,-18 30,-18 34,0 L38,80 Z" fill="#e9c9ae" stroke={INK} strokeWidth={5} />
							{[-22, -8, 6, 20].map((tx) => (
								<ellipse key={tx} cx={tx * (sg > 0 ? 1 : -1)} cy={-10} rx={7} ry={9} fill="#e9c9ae" stroke={INK} strokeWidth={3} />
							))}
						</g>
					))}
				</Tint>
			);
		}
		if (set === 'hallway') {
			const k = ramp(t, t60 + 1.3, tBed - 0.1);
			const y = lerp(760, 1180, k);
			return (
				<Tint light="dark">
					<Eli x={960} y={y} s={KID_S * 1.25 * hallScale(Math.min(y, 1065)) * 1.1} frame={f} pose="run" phase={k * 30} eyes="wide" brows="worried" mouth="o" />
				</Tint>
			);
		}
		// the empty room at night: Eli on the sill, the window open; something in the dark corner
		const jump = t >= t60 ? ramp(t, t60 + 0.1, t60 + 0.4) : 0;
		const runX = t >= t60 ? lerp(sillX, -300, ramp(t, t60 + 0.35, t60 + 1.3)) : sillX;
		const onSill = jump < 1;
		const ey = onSill ? lerp(er.sill, er.ground, jump) - Math.sin(jump * Math.PI) * 40 : er.ground;
		const shiver = t >= t58 ? 1.2 : 0.4;
		const cornerOn = t >= t59 - 0.2 && t < t60 + 0.3;
		return (
			<g>
				<Sash up={1} />
				<Tint light="dark">
					<Eli
						x={runX}
						y={ey}
						s={KID_S}
						frame={f}
						back={t < t60}
						shiver={shiver}
						{...(t >= t60 + 0.35 ? {pose: 'run' as const, turn: -0.8, phase: (sillX - runX) / (46 * KID_S)} : {})}
						eyes="wide"
						mouth="o"
						brows="worried"
					/>
				</Tint>
				{cornerOn ? (
					<g opacity={ramp(t, t59 - 0.2, t59 + 0.6)}>
						<g filter="url(#ch_dark)">
							<g style={{filter: 'brightness(0.32)'}}>
								<Widemouth x={cornerX} y={er.ground} s={WM_S} frame={f} mouth="grin" talk={wmT.talk} look={[1, -0.5]} />
							</g>
						</g>
						{[-1, 1].map((sg) => (
							<circle key={sg} cx={cornerX + (sg * 24 + 5) * WM_S} cy={er.ground - 155 * WM_S} r={4.4 * WM_S} fill="#e9eeff" />
						))}
					</g>
				) : null}
			</g>
		);
	};
	return <Shots shots={shots} world={(s) => world(s.set)} />;
};
