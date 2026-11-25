// Shared set-ups of "The Jinn Wedding": the majlis (Yadda and the girl on the low sofa), Noura's band drumming on the
// floor, the crowd of wedding guests, the title card, the 1997 newspaper front page and the sand close-up.
import React from 'react';
import {AbsoluteFill, Img, staticFile} from 'remotion';
import {Band1, Band2, Drummer, Girl, Guest, Noura, Yadda} from '../components/characters/Cast';
import type {ArmSpec} from '../components/characters/StickPerson';
import {Person} from '../stick/goat';
import {clamp01, GEO} from '../stick/kit';
import {Smoke} from '../stick/props';
import {FONT} from '../utils/fonts';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PP = Record<string, any>;

/** the wedding groove (matches drums_wedding.wav): 100 BPM, eighths of 0.3 s */
export const BEAT = 0.3;
/** 0..1 drum stroke envelope on the band's beat (a sharp hit, quick release) */
export const stroke = (t: number, off = 0) => {
	const ph = ((t + off) / BEAT) % 1;
	return Math.max(0, 1 - ph * 3.2);
};

/** arms beating a frame drum held up in front of the chest: the left hand holds the rim, the right hand strikes */
export const tarArms = (t: number, off = 0, play = 1): ArmSpec => {
	const h = stroke(t, off) * play;
	return {l: [22, -105], r: [34 + 26 * h, -70 - 40 * h]};
};
/** arms on the tabl (barrel drum across the lap): both hands, alternating */
export const tablArms = (t: number, off = 0, play = 1): ArmSpec => {
	const a = stroke(t, off) * play;
	const b = stroke(t, off + BEAT / 2) * play;
	return {l: [24 + 18 * a, -100 + 20 * a], r: [24 + 18 * b, -100 + 20 * b]};
};
/** clapping hands: the hands meet in front of the chest on the clap, part a little in between */
export const clapArms = (t: number, off = 0): ArmSpec => {
	const h = Math.max(0, Math.cos(((t + off) / (BEAT * 4)) * Math.PI * 2));
	const open = 1 - Math.pow(h, 6);
	return {l: [25 + 20 * open, -141 - 24 * open], r: [25 + 20 * open, -141 - 24 * open]};
};

// ---------------------------------------------------------------------------------------------------- the majlis
export const MAJ = {yadda: {x: 470, y: 905, s: 2.0}, girl: {x: 780, y: 880, s: 2.3}};

/** Yadda and the girl on the majlis sofa, incense curling up on the left */
export const MajlisPeople: React.FC<{f: number; t: number; y?: PP; g?: PP; smoke?: number}> = ({f, t, y = {}, g = {}, smoke = 1}) => (
	<g>
		<Smoke x={GEO.majlis.incense[0]} y={GEO.majlis.incense[1]} t={t} k={smoke} h={420} />
		<Person is={Yadda} name="yadda" x={MAJ.yadda.x} y={MAJ.yadda.y} s={MAJ.yadda.s} pose="sit" frame={f} look={[1, 0]} edge {...y} />
		<Person is={Girl} name="girl" x={MAJ.girl.x} y={MAJ.girl.y} s={MAJ.girl.s} child pose="sit" frame={f} look={[-1, 0]} edge {...g} />
	</g>
);

// ---------------------------------------------------------------------------------------------------- the band
/** Noura's band sitting on the floor in a row, drumming (play 0..1); `nouraP`/`drummerP` override those two */
export const Band: React.FC<{f: number; t: number; x0: number; y: number; s: number; gap?: number; play?: number; nouraP?: PP; drummerP?: PP; othersP?: PP}> = ({
	f,
	t,
	x0,
	y,
	s,
	gap = 150,
	play = 1,
	nouraP = {},
	drummerP = {},
	othersP = {},
}) => (
	<g>
		<Person is={Band1} name="band1" x={x0} y={y} s={s} pose="floor" frame={f} prop="tabl" arms={tablArms(t, 0.0, play)} look={[0.6, 0]} overlapOk {...othersP} />
		<Person is={Noura} name="noura" x={x0 + gap * s * 0.66} y={y} s={s} pose="floor" frame={f} prop="tar" arms={tarArms(t, 0.05, play)} look={[0.4, 0]} overlapOk {...nouraP} />
		<Person is={Drummer} name="drummer" x={x0 + 2 * gap * s * 0.66} y={y} s={s} pose="floor" frame={f} prop="tar" arms={tarArms(t, 0.12, play)} look={[-0.3, 0]} overlapOk {...drummerP} />
		<Person is={Band2} name="band2" x={x0 + 3 * gap * s * 0.66} y={y} s={s} pose="floor" frame={f} prop="tar" arms={tarArms(t, 0.2, play)} look={[-0.5, 0]} overlapOk {...othersP} />
	</g>
);

// ---------------------------------------------------------------------------------------------------- the guests
export type GuestMode = 'stand' | 'dance' | 'clap' | 'freeze';
/** where the guests stand in the gold hall: three rows getting nearer (and bigger) */
export const GUEST_SPOTS: Array<{x: number; y: number; s: number}> = [
	// an aisle is left open down the middle, so the bride on her chair can be seen from the doors
	...[570, 700, 1150, 1280].map((x) => ({x, y: 900, s: 1.0})),
	...[540, 700, 1170, 1330].map((x) => ({x, y: 975, s: 1.2})),
	...[770, 1150, 1400, 1640].map((x) => ({x, y: 1058, s: 1.45})),
];
/** the crowd of guests: dancing (swaying, hair swinging, arms up), clapping in perfect unison, or frozen; hooves and
 *  glowing eyes when asked */
export const Guests: React.FC<{f: number; t: number; mode: GuestMode; hooves?: boolean; hemLift?: number; glow?: boolean; look?: [number, number]; spots?: typeof GUEST_SPOTS; unison?: boolean; eyesOnly?: boolean; bg?: boolean}> = ({
	f,
	t,
	mode,
	hooves = false,
	hemLift = 0,
	glow = false,
	look,
	spots = GUEST_SPOTS,
	unison = true,
	eyesOnly = false,
	bg = false,
}) => (
	<g>
		{spots.map((p, n) => {
			const off = unison ? 0 : n * 0.07;
			const sway = mode === 'dance' ? Math.sin((t + off) * Math.PI * 2 * 0.83 + (unison ? 0 : n)) : 0;
			const arms: ArmSpec | 'armsUp' | 'down' =
				mode === 'clap' ? clapArms(t, off) : mode === 'dance' ? {l: [120 + 30 * sway, 10], r: [120 - 30 * sway, 10]} : 'down';
			return (
				<Person
					key={n}
					is={Guest}
					n={n}
					name={`guest${n}`}
					x={p.x + sway * 12 * p.s}
					y={p.y}
					s={p.s}
					frame={f}
					lean={sway * 7}
					tilt={sway * 8}
					arms={arms}
					hooves={hooves}
					hemLift={hemLift * (0.6 + 0.4 * Math.abs(sway))}
					eyes={glow ? 'glow' : 'dot'}
					look={look ?? [0, 0]}
					mouth="smile"
					idle={mode !== 'freeze'}
					overlapOk
					small={p.s < 1.2}
					eyesOnly={eyesOnly}
					noqa={eyesOnly || bg}
					edge
				/>
			);
		})}
	</g>
);

// ---------------------------------------------------------------------------------------------------- title
/** THE JINN WEDDING - عرس الجن, white on black, the incense smoke drifting through */
export const TitleCard: React.FC<{f: number; d: number}> = ({f, d}) => {
	const o = clamp01((f - 3) / 10) * clamp01((d - f) / 10);
	const t = f / 24;
	return (
		<AbsoluteFill style={{background: '#000', alignItems: 'center', justifyContent: 'center'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{position: 'absolute', inset: 0, opacity: o}}>
				<Smoke x={760} y={1080} h={900} t={t} k={0.7} color="#c9c0dc" />
				<Smoke x={1180} y={1080} h={900} t={t + 3} k={0.6} color="#c9c0dc" />
			</svg>
			<div style={{opacity: o, textAlign: 'center', color: '#efe7d6'}}>
				<div style={{fontFamily: FONT.marker, fontSize: 150, letterSpacing: 8, textShadow: '0 8px 0 #000, 0 0 40px rgba(255,220,150,0.18)'}}>THE JINN WEDDING</div>
				<div style={{fontFamily: '"DejaVu Sans", "FreeSerif", sans-serif', fontSize: 84, marginTop: 6, color: '#d9b24a', direction: 'rtl'}}>عرس الجن</div>
				<div style={{fontFamily: FONT.ui, fontSize: 30, letterSpacing: 14, color: '#9a958a', marginTop: 18}}>A KUWAITI LEGEND</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------------------------------------------- the newspaper
// An Arabic front page in the style of a 1990s Kuwaiti daily: a thuluth masthead, the issue number, Hijri and
// Gregorian dates and the price in fils, the "ears" beside the masthead, a red kicker over a heavy headline, a halftone
// photo, justified columns between thin rules, newsprint gone yellow. The paper ("Sawt Al-Deera") is invented, the
// story is the legend's, the singer is not named. An English translation strip comes up for the viewer.
const NP = {ink: '#1d1b18', red: '#9c1c17', rule: '#2a2722', paper: '#ebe4d0'};
const Rule: React.FC<{w?: number; double?: boolean; m?: string}> = ({w = 2, double = false, m = '6px 0'}) => (
	<div style={{borderTop: `${w}px solid ${NP.rule}`, borderBottom: double ? `1px solid ${NP.rule}` : undefined, height: double ? 4 : 0, margin: m}} />
);
const COL: React.CSSProperties = {fontFamily: FONT.arBody, fontSize: 25, lineHeight: '38px', textAlign: 'justify', color: NP.ink};
export const NewspaperPage: React.FC<{f: number; d: number}> = ({f, d}) => {
	const k = Math.min(1, f / Math.max(1, d));
	const ease = k * k * (3 - 2 * k);
	const z = 1.0 + 0.16 * ease;
	const ty = 30 - 250 * ease;
	const tIn = clamp01((f - 26) / 10);
	const second = f > d * 0.5;
	const tSwap = second ? clamp01((f - d * 0.5) / 8) : 1;
	const tr = second ? '\u201cThe singer has asked us not to print her name.\u201d' : '\u201cA taqaqa and her band played a wedding until dawn... in an abandoned house!\u201d';
	return (
		<AbsoluteFill style={{background: '#14110e', overflow: 'hidden'}}>
			<div
				dir="rtl"
				style={{
					position: 'absolute',
					left: 960 - 640,
					top: 0,
					width: 1280,
					height: 1900,
					transform: `translateY(${ty}px) scale(${z}) rotate(-1.6deg)`,
					transformOrigin: '50% 30%',
					background: `radial-gradient(ellipse at 50% 40%, #efe9d8 0%, ${NP.paper} 55%, #d9cba6 100%)`,
					boxShadow: '0 30px 90px rgba(0,0,0,0.75)',
					padding: '34px 46px',
					boxSizing: 'border-box',
					color: NP.ink,
				}}
			>
				{/* the top strip: issue, date (Hijri / Gregorian), pages and price */}
				<div style={{display: 'flex', justifyContent: 'space-between', fontFamily: FONT.arSmall, fontSize: 22, color: NP.ink}}>
					<span>العدد ٧٢١٤ - السنة الحادية والعشرون</span>
					<span>السبت ٦ ذو القعدة ١٤١٧ هـ - ١٥ مارس ١٩٩٧ م</span>
					<span>٤٨ صفحة - ١٠٠ فلس</span>
				</div>
				<Rule w={2} m="8px 0 4px" />
				{/* masthead between its two ears */}
				<div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 210}}>
					<div style={{width: 220, border: `2px solid ${NP.rule}`, padding: '10px 12px', fontFamily: FONT.arSmall, fontSize: 21, lineHeight: '32px'}}>
						<div style={{fontFamily: FONT.arHead, fontSize: 24, color: NP.red}}>في هذا العدد</div>
						المحليات ص ٦<br />الاقتصاد ص ١١<br />الرياضة ص ٣٨
					</div>
					<div style={{textAlign: 'center', flex: 1, whiteSpace: 'nowrap'}}>
						<div style={{fontFamily: FONT.arMast, fontSize: 124, lineHeight: '150px', color: NP.red, textShadow: '0 0 1px rgba(80,10,8,0.6)'}}>صوت الديرة</div>
						<div style={{fontFamily: FONT.arSmall, fontSize: 24, letterSpacing: 1, marginTop: 2}}>جريدة كويتية يومية مستقلة</div>
					</div>
					<div style={{width: 220, border: `2px solid ${NP.rule}`, padding: '10px 12px', fontFamily: FONT.arSmall, fontSize: 21, lineHeight: '32px'}}>
						<div style={{fontFamily: FONT.arHead, fontSize: 24, color: NP.red}}>الطقس اليوم</div>
						صحو إلى غائم جزئياً<br />العظمى ٢٧ - الصغرى ١٤
					</div>
				</div>
				<Rule w={5} double m="6px 0 14px" />
				{/* the lead story */}
				<div style={{fontFamily: FONT.arHead, fontSize: 40, color: NP.red, lineHeight: '50px'}}>قصة غريبة يتداولها أهالي الصباحية</div>
				<div style={{fontFamily: FONT.arHead, fontSize: 68, lineHeight: '92px', marginTop: 4, whiteSpace: 'nowrap'}}>طقاقة وفرقتها أحيوا عرسا حتى الفجر</div>
				<div style={{fontFamily: FONT.arHead, fontSize: 92, lineHeight: '112px'}}>... في بيت مهجور!</div>
				<Rule w={2} m="12px 0 14px" />
				<div style={{display: 'flex', gap: 26}}>
					{/* right: the decks and the first columns */}
					<div style={{width: 470}}>
						{['رجل وجدهم عند الفجر أمام بيت محترق منذ سنوات', 'آثار حوافر صغيرة حول آثار أقدامهم في الرمل', 'المطربة طلبت عدم نشر اسمها'].map((t) => (
							<div key={t} style={{fontFamily: FONT.arHead, fontSize: 30, lineHeight: '42px', borderBottom: `1px solid ${NP.rule}`, padding: '6px 0'}}>
								<span style={{color: NP.red}}>■ </span>
								{t}
							</div>
						))}
						<div style={{...COL, marginTop: 12}}>
							<b style={{fontFamily: FONT.arHead, fontWeight: 400}}>كتب المحرر المحلي:</b> روت مطربة شعبية معروفة لـ«صوت الديرة» تفاصيل ليلة غريبة عاشتها مع أعضاء فرقتها، بعد
							أن اتصلت بها امرأة قالت إنها أم العروس، وطلبت منها إحياء حفل زفاف ابنتها في منطقة الصباحية مقابل خمسمئة دينار. وقالت إن سيارة سوداء جاءت لنقل الفرقة، وإن
							السائق لم ينطق بكلمة واحدة طوال الطريق.
						</div>
					</div>
					{/* left: the halftone photo of the ruin and its caption, more columns under it */}
					<div style={{flex: 1, borderRight: `1px solid ${NP.rule}`, paddingRight: 24}}>
						<div style={{position: 'relative', height: 420, overflow: 'hidden', border: `2px solid ${NP.rule}`}}>
							<Img src={staticFile('plates/ruin_dawn.jpg')} style={{width: '100%', height: '100%', objectFit: 'cover', objectPosition: '50% 60%', filter: 'grayscale(1) contrast(1.35) brightness(1.08)'}} />
							<div style={{position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, rgba(20,18,15,0.55) 1.1px, transparent 1.7px)', backgroundSize: '5px 5px', mixBlendMode: 'multiply'}} />
							<div style={{position: 'absolute', inset: 0, background: 'rgba(235,228,208,0.18)', mixBlendMode: 'screen'}} />
						</div>
						<div style={{fontFamily: FONT.arSmall, fontSize: 21, marginTop: 6, color: '#3a3630'}}>البيت كما بدا صباح اليوم التالي (تصوير: المحرر)</div>
						<div style={{display: 'flex', gap: 22, marginTop: 10}}>
							<div style={{...COL, flex: 1}}>
								وأضافت أنهم وصلوا إلى بيت كبير تشع منه الأنوار لم يسبق لها أن رأته، رغم أنها غنت في أغلب بيوت الكويت، وأن الضيوف رقصوا وصفقوا طوال الليل على إيقاع واحد ولم
								يلمسوا الطعام.
							</div>
							<div style={{...COL, flex: 1, borderRight: `1px solid ${NP.rule}`, paddingRight: 20}}>
								وعند الفجر خرجت الفرقة لتجد رجلاً يسألهم عما يفعلونه أمام بيت مهجور منذ سنوات، وحين التفتوا لم يجدوا سوى أطلال بيت محترق. وأكدت المطربة أنها لن تغني في الأعراس بعد اليوم.
							</div>
						</div>
					</div>
				</div>
				<Rule w={3} m="18px 0 12px" />
				{/* the rest of the front page */}
				<div style={{display: 'flex', gap: 24}}>
					<div style={{flex: 1}}>
						<div style={{fontFamily: FONT.arHead, fontSize: 36, lineHeight: '46px'}}>انخفاض ملحوظ في درجات الحرارة نهاية الأسبوع</div>
						<div style={{...COL, fontSize: 22, lineHeight: '33px'}}>توقعت إدارة الأرصاد أن تشهد البلاد انخفاضاً في درجات الحرارة مع رياح شمالية غربية نشطة مثيرة للغبار على المناطق المكشوفة.</div>
					</div>
					<div style={{flex: 1, borderRight: `1px solid ${NP.rule}`, paddingRight: 22}}>
						<div style={{fontFamily: FONT.arHead, fontSize: 36, lineHeight: '46px'}}>افتتاح سوق شعبي جديد في الجهراء</div>
						<div style={{...COL, fontSize: 22, lineHeight: '33px'}}>يضم السوق محلات للأقمشة والبخور والعطور الشرقية، ويفتح أبوابه يومياً بعد صلاة العصر.</div>
					</div>
					<div style={{width: 260, border: `3px double ${NP.rule}`, padding: 12, textAlign: 'center', fontFamily: FONT.arHead, fontSize: 30, lineHeight: '42px'}}>
						للبيع
						<div style={{fontFamily: FONT.arSmall, fontSize: 22, lineHeight: '32px'}}>سيارة صالون موديل ١٩٩٤ بحالة الوكالة</div>
					</div>
				</div>
				{/* newsprint: grain, a fold, foxed edges */}
				<Img src={staticFile('textures/grain_1.png')} style={{position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.14, mixBlendMode: 'multiply'}} />
				<div style={{position: 'absolute', left: 0, right: 0, top: 940, height: 26, background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.10) 45%, rgba(255,255,255,0.18) 55%, rgba(0,0,0,0) 100%)'}} />
				<div style={{position: 'absolute', inset: 0, boxShadow: 'inset 0 0 120px rgba(150,110,40,0.35)'}} />
			</div>
			{/* translation for the viewer */}
			<div style={{position: 'absolute', left: 120, right: 120, top: 760, display: 'flex', justifyContent: 'center', opacity: tIn * tSwap}}>
				<div style={{background: 'rgba(10,9,8,0.82)', padding: '14px 26px', borderRadius: 6, borderLeft: '6px solid #d9b24a', maxWidth: 1300}}>
					<div style={{fontFamily: FONT.ui, fontSize: 18, letterSpacing: 5, color: '#d9b24a', fontWeight: 700}}>TRANSLATION - KUWAIT, 15 MARCH 1997</div>
					<div style={{fontFamily: FONT.ui, fontSize: 36, lineHeight: '46px', color: '#f4efe4', fontWeight: 600, marginTop: 4}}>{tr}</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// ---------------------------------------------------------------------------------------------------- the sand
/** the sand at dawn, close: the band's four trails of footprints walking away - and, all around them, hundreds of small
 *  cloven hoofprints (k 0..1: how many have been seen so far) */
export const SandClose: React.FC<{f: number; d: number; k: number}> = ({f, k}) => {
	const r = (i: number, j: number) => {
		const v = Math.sin(i * 127.1 + j * 311.7 + 74.7) * 43758.5453;
		return v - Math.floor(v);
	};
	const z = 1 + 0.05 * (f / 240);
	// four trails from the bottom left toward the top right
	const steps: Array<{x: number; y: number; a: number; side: number}> = [];
	for (let w = 0; w < 4; w++) {
		for (let i = 0; i < 9; i++) {
			const u = i / 8;
			const x = 260 + w * 150 + u * 1150 + Math.sin(u * 3 + w) * 30;
			const y = 1040 - u * 900 + w * 22;
			steps.push({x: x + (i % 2 ? 18 : -18), y, a: -38, side: i % 2});
		}
	}
	const nH = Math.round(320 * k);
	return (
		<AbsoluteFill style={{background: 'radial-gradient(ellipse at 50% 45%, #d8c7a2 0%, #c9b690 55%, #8f7f62 100%)', overflow: 'hidden'}}>
			<svg viewBox="0 0 1920 1080" width={1920} height={1080} style={{transform: `scale(${z})`}}>
				{Array.from({length: 46}, (_, i) => (
					<path key={i} d={`M${(i * 211) % 1920},${(i * 97) % 1080} q40,-10 80,0`} stroke="#b9a67f" strokeWidth={3} fill="none" opacity={0.55} />
				))}
				{steps.map((p, i) => (
					<g key={`f${i}`} transform={`translate(${p.x} ${p.y}) rotate(${p.a})`}>
						<ellipse cx={0} cy={-14} rx={17} ry={22} fill="#9a8664" />
						<ellipse cx={0} cy={22} rx={13} ry={14} fill="#9a8664" />
						<ellipse cx={-2} cy={-16} rx={14} ry={18} fill="#8a7656" />
						<ellipse cx={-2} cy={20} rx={10} ry={11} fill="#8a7656" />
					</g>
				))}
				{Array.from({length: nH}, (_, i) => {
					const x = 60 + 1800 * r(i, 1);
					const y = 50 + 980 * r(i, 2);
					const a = -60 + 120 * r(i, 3);
					const sc = 0.8 + 0.5 * r(i, 4);
					return (
						<g key={`h${i}`} transform={`translate(${x} ${y}) rotate(${a}) scale(${sc})`}>
							{[-1, 1].map((sg) => (
								<path key={sg} d={`M${sg * 3},10 C${sg * 3},-4 ${sg * 6},-14 ${sg * 11},-15 C${sg * 17},-12 ${sg * 16},4 ${sg * 13},11 Z`} fill="#4e3d2a" stroke="#c9b58c" strokeWidth={2} />
							))}
						</g>
					);
				})}
			</svg>
		</AbsoluteFill>
	);
};
