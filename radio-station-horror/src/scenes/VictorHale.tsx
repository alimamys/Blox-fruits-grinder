// ~3:56 – Victor Hale: the market, the 1987 disappearance, then the evidence
// inserts (archive search, newspaper, police photos, the notebook).
import React from 'react';
import {AbsoluteFill} from 'remotion';
import {Adam, Seller} from '../components/Characters';
import {Flash, Vignette} from '../components/CRTNoise';
import {DocCamera} from '../components/DocCamera';
import {ApartmentScenePhoto, CaseFolder, PhotoPrint, VictorPortrait} from '../components/EvidencePhoto';
import {NotebookPage} from '../components/NotebookPage';
import {OldNewspaper} from '../components/OldNewspaper';
import {Phone} from '../components/Phone';
import {Radio} from '../components/Radio';
import {Chair, Desk} from '../components/Furniture';
import {Street} from '../components/sets/Exteriors';
import {Market} from '../components/sets/Interiors';
import {camKeys, Layer, Stage} from '../components/Stage';
import {StaticOverlay} from '../components/StaticOverlay';
import {POSES, walkPose} from '../components/StickPerson';
import {EASE, hit, keys, ramp} from '../utils/anim';
import {FONT} from '../utils/fonts';
import {C} from '../utils/palette';
import {useBoil, wobEllipse, wobLine, wobPath, wobPoly, wobRect} from '../utils/wobble';
import {Shot, useShot} from '../utils/timeline-context';
import {CartoonFinish} from './shared';
import {MarkerNote} from './rooms';

const V01Decided: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Stage cam={camKeys(f, [[0, {x: 960, y: 600, zoom: 1.3}], [dur, {x: 980, y: 600, zoom: 1.45}]], EASE.linear)} overlay={<CartoonFinish />}>
			<Layer>
				<Street day scroll={f * 6} />
				<Adam x={900} y={860} pose={walkPose(f * 0.3)} facing={1} expression="determined" look={[1, 0]} />
				<Radio x={870} y={620} scale={0.16} />
			</Layer>
		</Stage>
	);
};

const V02Market: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const rec = api.at('remembered');
	const year = api.at('year');
	const laughed = api.at('adamLaughed');
	const didnt = api.at('sellerDidnt');
	const close = f >= api.at('askedWhen');
	const cam = camKeys(f, [
		[0, {x: 960, y: 560, zoom: 1.15}],
		[rec, {x: 960, y: 520, zoom: 1.3}],
		[api.at('receiver'), {x: 900, y: 470, zoom: 1.7}],
		[api.at('clearance') - 1, {x: 900, y: 470, zoom: 1.8}],
		[api.at('clearance'), {x: 960, y: 520, zoom: 1.3}],
		[api.at('askedWhen'), {x: 960, y: 520, zoom: 1.4}],
		[year, {x: 880, y: 430, zoom: 2.3}],
		[laughed, {x: 1140, y: 430, zoom: 2.4}],
		[didnt, {x: 880, y: 430, zoom: 2.6}],
		[dur, {x: 880, y: 440, zoom: 3.1}],
	]);
	const sellerExpr = f >= didnt ? 'blank' : f >= rec ? 'neutral' : 'smile';
	return (
		<Stage
			cam={cam}
			overlay={
				<>
					{f >= year && f < laughed && <MarkerNote text="1987." x={1150} y={160} size={130} rot={-8} />}
					<CartoonFinish vignette={f >= didnt ? 0.75 : 0.4} />
				</>
			}
		>
			<Layer>
				<Market behindTable={<Seller x={880} y={735} scale={0.9} upperOnly expression={sellerExpr} look={[0.7, 0]} blink={f >= didnt ? false : undefined} />} />
				<Radio x={960} y={540} scale={0.2} />
				<Adam
					x={close ? 1140 : 1200}
					y={820}
					pose={f >= laughed && f < didnt ? POSES.handsOnHead : POSES.stand}
					facing={-1}
					expression={f >= laughed && f < didnt ? 'nervous' : f >= didnt ? 'worried' : 'neutral'}
					sweat={f >= laughed}
					look={[1, 0]}
				/>
			</Layer>
		</Stage>
	);
};

/** MS Paint flashback of the empty apartment – a dashed outline where a man should be. */
const MissingRoom: React.FC<{items: number; dashed: number; locks: number; boxes?: boolean}> = ({items, dashed, locks, boxes = false}) => {
	const b = useBoil();
	const pop = (i: number) => Math.min(1, Math.max(0, items - i));
	return (
		<g>
			<rect x={-400} y={-400} width={2720} height={1200} fill="#c9b98a" />
			<rect x={-400} y={800} width={2720} height={700} fill="#7a5a3a" />
			<path d={wobLine(-400, 800, 2320, 800, 4000 + b, 2)} stroke={C.ink} strokeWidth={8} />
			{/* door with locks */}
			<path d={wobRect(1500, 300, 260, 500, 4001 + b, 2)} fill={C.wood} stroke={C.ink} strokeWidth={6} />
			<circle cx={1720} cy={560} r={13} fill={C.yellow} stroke={C.ink} strokeWidth={4} />
			{locks > 0 && (
				<g opacity={locks}>
					<path d="M 1745 480 q -40 30 -80 6" stroke="#bbb" strokeWidth={7} fill="none" strokeDasharray="10 5" />
					<rect x={1700} y={510} width={40} height={24} fill="#999" stroke={C.ink} strokeWidth={4} />
				</g>
			)}
			<Desk x={500} y={640} w={520} h={160} />
			<Chair x={760} y={800} facing={1} />
			{boxes &&
				[0, 1, 2].map((i) => <path key={i} d={wobRect(1100 + i * 110, 680 - (i % 2) * 90, 110, 120, 4010 + i + b, 2)} fill="#b08a54" stroke={C.ink} strokeWidth={5} />)}
			{/* plate of food */}
			<g opacity={pop(0)} transform={`translate(600 630) scale(${0.6 + pop(0) * 0.4})`}>
				<path d={wobEllipse(0, 0, 70, 16, 4020 + b, 2)} fill={C.white} stroke={C.ink} strokeWidth={5} />
				<path d={wobEllipse(0, -10, 34, 14, 4021 + b, 2)} fill="#c8742c" stroke={C.ink} strokeWidth={4} />
				<path d={wobPath([[-10, -30], [-4, -50], [-12, -70]], 4022 + b, 2)} stroke="#eee" strokeWidth={4} fill="none" />
			</g>
			{/* wallet */}
			<g opacity={pop(1)} transform={`translate(760 625) scale(${0.6 + pop(1) * 0.4})`}>
				<path d={wobRect(-36, -18, 72, 26, 4023 + b, 1.5)} fill="#4a2a14" stroke={C.ink} strokeWidth={4} />
			</g>
			{/* keys */}
			<g opacity={pop(2)} transform={`translate(880 628) scale(${0.6 + pop(2) * 0.4})`}>
				<path d={wobEllipse(0, -6, 14, 14, 4024 + b, 1)} fill="none" stroke="#c9c9c9" strokeWidth={5} />
				<path d={wobLine(10, -2, 44, 6, 4025 + b, 1)} stroke="#c9c9c9" strokeWidth={6} />
			</g>
			{/* shoes */}
			<g opacity={pop(3)} transform={`translate(1380 790) scale(${0.6 + pop(3) * 0.4})`}>
				<path d={wobPoly([[-70, 0], [-70, -26], [-20, -30], [0, 0]], 4026 + b, 1.5)} fill={C.ink} />
				<path d={wobPoly([[10, 0], [10, -26], [60, -30], [80, 0]], 4027 + b, 1.5)} fill={C.ink} />
			</g>
			{/* the missing man: a dashed outline on the chair */}
			{dashed > 0 && (
				<g opacity={dashed} stroke={C.red} strokeWidth={6} strokeDasharray="14 10" fill="none">
					<circle cx={724} cy={514} r={44} />
					<path d="M 724 560 L 724 700 L 800 700 L 800 790 M 724 600 L 790 640" />
				</g>
			)}
		</g>
	);
};

const V03Clearance: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const dis = api.at('disappeared');
	return (
		<Stage cam={camKeys(f, [[0, {x: 960, y: 540, zoom: 1.05}], [dur, {x: 800, y: 560, zoom: 1.35}]])} overlay={<><MarkerNote text={f < dis ? 'APARTMENT CLEARANCE' : '???'} x={100} y={70} size={70} /><CartoonFinish /></>}>
			<Layer>
				<MissingRoom items={0} dashed={ramp(f, dis, dis + 10)} locks={0} boxes />
			</Layer>
		</Stage>
	);
};

const V06Locked: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const at = (id: string) => api.at(id);
	const items = f < at('food') ? 0 : f < at('wallet') ? 1 : f < at('keys') ? 2 : f < at('shoes') ? 3 : 4;
	const popIn = (id: string) => ramp(f, at(id), at(id) + 5);
	const exceptHim = at('exceptHim');
	const door = {x: 1630, y: 520, zoom: 2.3};
	const food = {x: 640, y: 600, zoom: 2.6};
	const wallet = {x: 760, y: 610, zoom: 3};
	const keyPos = {x: 880, y: 610, zoom: 3};
	const shoes = {x: 1380, y: 760, zoom: 2.6};
	const wide = {x: 960, y: 560, zoom: 1.1};
	const cam = camKeys(f, [
		[0, {x: 1630, y: 520, zoom: 2.2}],
		[at('food') - 1, door],
		[at('food') + 5, food],
		[at('wallet'), food],
		[at('wallet') + 5, wallet],
		[at('keys'), wallet],
		[at('keys') + 5, keyPos],
		[at('shoes'), keyPos],
		[at('shoes') + 5, shoes],
		[at('everything'), shoes],
		[at('everything') + 10, wide],
		[exceptHim, {x: 900, y: 560, zoom: 1.15}],
		[dur, {x: 740, y: 600, zoom: 1.7}],
	], EASE.out);
	return (
		<Stage
			cam={cam}
			overlay={
				<>
					{f < at('food') && <MarkerNote text="LOCKED FROM THE INSIDE" x={180} y={120} size={84} rot={-3} />}
					{f >= at('food') && f < at('everything') && (
						<MarkerNote
							text={f < at('wallet') ? 'FOOD' : f < at('keys') ? 'WALLET' : f < at('shoes') ? 'KEYS' : 'SHOES'}
							x={760}
							y={160}
							size={110}
							opacity={Math.max(popIn('food'), 1)}
						/>
					)}
					{f >= exceptHim && <MarkerNote text="?" x={1000} y={200} size={200} rot={8} />}
					<CartoonFinish />
				</>
			}
		>
			<Layer>
				<MissingRoom items={items} dashed={ramp(f, exceptHim, exceptHim + 8)} locks={1} />
				{f < at('food') && (
					<g>
						<path d="M 1300 300 L 1640 470" stroke={C.red} strokeWidth={10} strokeLinecap="round" />
						<path d="M 1300 300 L 1690 515" stroke={C.red} strokeWidth={10} strokeLinecap="round" />
					</g>
				)}
			</Layer>
		</Stage>
	);
};

/** Digital newspaper archive – a realistic UI screen. */
const V08Archive: React.FC = () => {
	const api = useShot();
	const {f} = api;
	const query = 'radio missing 1987 locked apartment';
	const typedN = Math.min(query.length, Math.floor(f * 1.4));
	const results = f >= api.at('archive');
	const rStart = api.at('archive');
	const cursorX = keys(f, [[rStart, 1500], [rStart + 30, 760]], EASE.inOut);
	const cursorY = keys(f, [[rStart, 900], [rStart + 30, 470]], EASE.inOut);
	const clicked = f > rStart + 34;
	const rows = [
		{t: 'LOCAL RADIO ENTHUSIAST MISSING WITHOUT TRACE', s: 'The Morning Record · Nov 10, 1987 · p. 4'},
		{t: 'Council delays vote on bus route 9', s: 'The Morning Record · Nov 10, 1987 · p. 4'},
		{t: 'Shortwave club to meet at library', s: 'The Morning Record · Oct 2, 1987 · p. 11'},
	];
	return (
		<AbsoluteFill style={{background: '#16181d', fontFamily: FONT.ui}}>
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 90, background: '#22252c', display: 'flex', alignItems: 'center', paddingLeft: 60, gap: 18}}>
				{['#ff5f57', '#febc2e', '#28c840'].map((c) => (
					<div key={c} style={{width: 20, height: 20, borderRadius: 10, background: c}} />
				))}
				<div style={{marginLeft: 40, color: '#c9ccd4', fontSize: 30}}>City Library — Digital Newspaper Archive</div>
			</div>
			<div style={{position: 'absolute', left: 160, top: 170, right: 160, height: 90, background: '#fff', borderRadius: 12, display: 'flex', alignItems: 'center', padding: '0 30px', fontSize: 40, color: '#222'}}>
				🔍&nbsp;&nbsp;{query.slice(0, typedN)}
				<span style={{opacity: f % 16 < 8 ? 1 : 0}}>|</span>
			</div>
			{results &&
				rows.map((r, i) => (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: 160,
							right: 160,
							top: 330 + i * 190,
							height: 160,
							background: i === 0 && clicked ? '#2d3a55' : '#1f2228',
							borderRadius: 12,
							display: 'flex',
							alignItems: 'center',
							gap: 36,
							padding: '0 30px',
							opacity: ramp(f, rStart + i * 4, rStart + i * 4 + 6),
						}}
					>
						<div style={{width: 110, height: 130, background: '#d9cfb5', boxShadow: 'inset 0 0 0 3px #aaa'}} />
						<div>
							<div style={{color: '#f1f1f1', fontSize: 38, fontWeight: 600}}>{r.t}</div>
							<div style={{color: '#9aa0aa', fontSize: 28, marginTop: 10}}>{r.s}</div>
						</div>
					</div>
				))}
			{results && (
				<svg width={60} height={80} viewBox="0 0 60 80" style={{position: 'absolute', left: cursorX, top: cursorY}}>
					<path d="M 4 4 L 4 60 L 18 46 L 30 72 L 40 66 L 28 42 L 48 42 Z" fill="#fff" stroke="#000" strokeWidth={4} />
				</svg>
			)}
			<StaticOverlay opacity={0.04} blend="overlay" seed={81} />
		</AbsoluteFill>
	);
};

/** SPECIAL E: the newspaper. Evidence style – no MS Paint. */
const V09Newspaper: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const at = (id: string) => api.at(id);
	const cam = camKeys(f, [
		[0, {x: 750, y: 900, zoom: 0.5}],
		[at('headline'), {x: 750, y: 480, zoom: 0.95}],
		[at('name') - 2, {x: 750, y: 470, zoom: 1.05}],
		[at('name') + 10, {x: 330, y: 1000, zoom: 1.25}],
		[dur, {x: 330, y: 980, zoom: 1.45}],
	]);
	return (
		<DocCamera x={cam.x ?? 0} y={cam.y ?? 0} zoom={cam.zoom ?? 1} rot={-1.5} bg="#0e0d0b">
			<OldNewspaper highlightHeadline={ramp(f, at('headline') + 6, at('headline') + 30)} circleName={ramp(f, at('name') + 12, at('name') + 30)} />
			<AbsoluteFill />
		</DocCamera>
	);
};

const V11Photos: React.FC = () => {
	const api = useShot();
	const {f, dur} = api;
	const onDesk = api.at('onDesk');
	const radio = api.at('adamsRadio');
	const z = keys(f, [[0, 1], [onDesk, 1.15], [radio, 1.9], [dur, 2.2]], EASE.inOut);
	const ox = keys(f, [[0, 0], [onDesk, -60], [radio, -170], [dur, -175]], EASE.inOut);
	const oy = keys(f, [[0, 0], [onDesk, -20], [radio, -65], [dur, -65]], EASE.inOut);
	const circle = ramp(f, radio + 6, radio + 24);
	return (
		<AbsoluteFill style={{background: '#000'}}>
			<AbsoluteFill style={{transform: `scale(${z}) translate(${ox}px, ${oy}px)`, transformOrigin: '50% 50%'}}>
				<CaseFolder>
					<PhotoPrint rotate={-4} style={{left: 130, top: 230}} caption="HALE, V. — 1985">
						<VictorPortrait width={330} height={412} />
					</PhotoPrint>
					<PhotoPrint rotate={2.5} style={{left: 720, top: 260}} caption="87-1106 · SCENE 4 · DESK">
						<div style={{position: 'relative'}}>
							<ApartmentScenePhoto width={900} height={619} />
							<svg width={900} height={619} viewBox="0 0 640 440" style={{position: 'absolute', inset: 0}}>
								<path
									d="M 150 150 C 150 110 410 100 420 160 C 430 230 260 330 160 300 C 110 280 120 200 190 160"
									stroke="rgba(220,20,20,0.9)"
									strokeWidth={7}
									fill="none"
									strokeLinecap="round"
									pathLength={1}
									strokeDasharray={1}
									strokeDashoffset={1 - circle}
								/>
							</svg>
						</div>
					</PhotoPrint>
				</CaseFolder>
			</AbsoluteFill>
			<Vignette strength={0.6} />
		</AbsoluteFill>
	);
};

/** SPECIAL F: the notebook scan inside an image viewer. */
const V12Notebook: React.FC<{phase: 'intro' | 'scan' | 'phone' | 'name'}> = ({phase}) => {
	const api = useShot();
	const {f, dur} = api;
	const at = (id: string) => api.at(id);
	let cam = {x: 650, y: 850, zoom: 0.58};
	let hlPhone = 0;
	let hlName = 0;
	let hlDate = 0;
	let circle = 0;
	if (phase === 'intro') {
		const flip = Math.floor(ramp(f, at('pages'), dur, 0, 3, EASE.linear));
		cam = {x: 650 + flip * 30, y: 850 - flip * 40, zoom: 0.58 + f * 0.0008};
	} else if (phase === 'scan') {
		cam = camKeys(f, [[0, {x: 600, y: 200, zoom: 1.2}], [at('times'), {x: 600, y: 420, zoom: 1.25}], [at('names'), {x: 600, y: 480, zoom: 1.3}], [dur, {x: 640, y: 700, zoom: 1.1}]], EASE.inOut) as typeof cam;
	} else if (phase === 'phone') {
		cam = camKeys(f, [[0, {x: 640, y: 760, zoom: 1}], [at('phoneNumber'), {x: 400, y: 900, zoom: 1.9}], [dur, {x: 400, y: 900, zoom: 2.3}]], EASE.slowIn) as typeof cam;
		hlPhone = ramp(f, at('phoneNumber') + 4, at('phoneNumber') + 20);
	} else {
		// below it: name, beside: time + date, then "Tomorrow."
		hlPhone = 1;
		cam = camKeys(f, [
			[0, {x: 420, y: 920, zoom: 1.9}],
			[at('adamRahman'), {x: 480, y: 1030, zoom: 1.75}],
			[at('beside'), {x: 600, y: 1020, zoom: 1.4}],
			[at('time'), {x: 880, y: 990, zoom: 2.1}],
			[at('date'), {x: 960, y: 1060, zoom: 2.1}],
			[dur, {x: 960, y: 1060, zoom: 2.3}],
		], EASE.inOut) as typeof cam;
		hlName = ramp(f, at('adamRahman') + 2, at('adamRahman') + 18);
		circle = ramp(f, at('adamRahman') + 14, at('adamRahman') + 34);
		hlDate = ramp(f, at('time') + 2, at('date') + 16, 0, 1, EASE.linear);
	}
	return (
		<AbsoluteFill style={{background: '#1b1d22'}}>
			<DocCamera x={cam.x} y={cam.y} zoom={cam.zoom} rot={0.8} bg="#2a2c31">
				<NotebookPage highlightPhone={hlPhone} highlightName={hlName} highlightDate={hlDate} circle={circle} />
			</DocCamera>
			<div style={{position: 'absolute', left: 0, right: 0, top: 0, height: 64, background: 'rgba(20,22,26,0.92)', display: 'flex', alignItems: 'center', padding: '0 40px', justifyContent: 'space-between', fontFamily: FONT.ui, fontSize: 26, color: '#c9ccd4'}}>
				<span>HALE_V_NOTEBOOK_03 / SCAN_0043.TIF</span>
				<span>scanned from evidence box 87-1106 · 1987</span>
			</div>
			<StaticOverlay opacity={0.035} blend="overlay" seed={91} />
		</AbsoluteFill>
	);
};

/** Adam's own phone – the same number. */
const V14OwnNumber: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Stage cam={{x: 960, y: 560, zoom: 1 + (f / dur) * 0.15}} bg="#141a33" overlay={<CartoonFinish vignette={0.7} />}>
			<Layer>
				<rect x={-200} y={-200} width={2400} height={1500} fill="#141a33" />
				<Phone x={810} y={160} scale={1.3}>
					<rect width={260} height={500} fill="#f2f2f5" />
					<text x={130} y={60} fontFamily={FONT.ui} fontSize={20} fill="#666" textAnchor="middle">
						My Card
					</text>
					<circle cx={130} cy={140} r={48} fill={C.blue} />
					<text x={130} y={156} fontFamily={FONT.ui} fontSize={40} fill="#fff" textAnchor="middle" fontWeight={600}>
						AR
					</text>
					<text x={130} y={230} fontFamily={FONT.ui} fontSize={26} fill="#111" textAnchor="middle" fontWeight={600}>
						Adam Rahman
					</text>
					<rect x={20} y={270} width={220} height={70} rx={10} fill="#fff" />
					<text x={36} y={298} fontFamily={FONT.ui} fontSize={16} fill="#888">
						mobile
					</text>
					<text x={36} y={326} fontFamily={FONT.ui} fontSize={24} fill="#2a6ad9">
						555-0117
					</text>
				</Phone>
			</Layer>
		</Stage>
	);
};

const V15Breath: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Stage cam={camKeys(f, [[0, {x: 960, y: 470, zoom: 2.6}], [dur, {x: 960, y: 470, zoom: 3.2}]], EASE.linear)} bg="#0c1024" overlay={<CartoonFinish vignette={0.8} />}>
			<Layer>
				<rect x={-200} y={-200} width={2400} height={1500} fill="#0c1024" />
				<ellipse cx={960} cy={500} rx={300} ry={260} fill="#bfe0ff" opacity={0.14} />
				<Adam x={960} y={900} pose={POSES.standStiff} expression="terrified" look={[0, 0.5]} blink={false} pale={0.7} />
			</Layer>
		</Stage>
	);
};

/** "Tomorrow." – the wall calendar, NOV 6 circled. */
const V18Tomorrow: React.FC = () => {
	const {f, dur} = useShot();
	const b = useBoil();
	const circle = ramp(f, 4, 20);
	return (
		<Stage cam={camKeys(f, [[0, {x: 960, y: 560, zoom: 1.4}], [dur, {x: 1064, y: 560, zoom: 2.0}]], EASE.slowIn)} shake={hit(f, 1, 8) * 0.4} bg={C.navyWall} overlay={<><Flash amount={hit(f, 0, 5) * 0.3} /><CartoonFinish vignette={0.75} /></>}>
			<Layer>
				<rect x={-200} y={-200} width={2400} height={1500} fill={C.navyWall} />
				<path d={wobRect(560, 160, 800, 760, 5000 + b, 3)} fill={C.white} stroke={C.ink} strokeWidth={8} />
				<rect x={566} y={166} width={788} height={130} fill={C.red} />
				<text x={960} y={260} fontFamily={FONT.marker} fontSize={86} fill={C.white} textAnchor="middle">
					NOVEMBER
				</text>
				{Array.from({length: 30}).map((_, i) => {
					const col = (i + 6) % 7;
					const row = Math.floor((i + 6) / 7);
					const x = 600 + col * 106;
					const y = 360 + row * 108;
					const day = i + 1;
					return (
						<g key={day}>
							<text x={x + 40} y={y + 40} fontFamily={FONT.paint} fontWeight={700} fontSize={40} fill={C.ink} textAnchor="middle">
								{day}
							</text>
							{day < 5 && <path d={wobPath([[x + 10, y + 5], [x + 70, y + 55]], 5100 + day + b, 2)} stroke={C.ink} strokeWidth={5} />}
							{day === 5 && <path d={wobPath([[x + 5, y + 5], [x + 75, y + 55]], 5106 + b, 2)} stroke={C.ink} strokeWidth={5} />}
						</g>
					);
				})}
				{circle > 0 && (
					<path
						d="M 1064 494 m -58 0 a 58 46 0 1 0 116 0 a 58 46 0 1 0 -116 0"
						stroke={C.red}
						strokeWidth={10}
						fill="none"
						pathLength={1}
						strokeDasharray={1}
						strokeDashoffset={1 - circle}
					/>
				)}
				<path d={wobPath([[1190, 640], [1110, 540]], 5200 + b, 2)} stroke={C.red} strokeWidth={8} opacity={circle} />
				<text x={1150} y={690} fontFamily={FONT.marker} fontSize={48} fill={C.red} opacity={circle}>
					1:17 AM
				</text>
			</Layer>
		</Stage>
	);
};

export const VictorHale: React.FC = () => (
	<>
		<Shot from="decided" name="Decides to find out">
			<V01Decided />
		</Shot>
		<Shot from="market" to="receiver" name="The seller remembers">
			<V02Market />
		</Shot>
		<Shot from="clearance" to="disappeared" name="Apartment clearance">
			<V03Clearance />
		</Shot>
		<Shot from="askedWhen" to="sellerDidnt" name="1987">
			<V02Market />
		</Shot>
		<Shot from="alone" name="He lived alone">
			<V02Alone />
		</Shot>
		<Shot from="locked" to="exceptHim" name="Locked from inside / inventory">
			<V06Locked />
		</Shot>
		<Shot from="searched" to="archive" name="Archive search (UI)">
			<V08Archive />
		</Shot>
		<Shot from="article" to="name" name="SPECIAL E – newspaper">
			<V09Newspaper />
		</Shot>
		<Shot from="photos" to="adamsRadio" name="Police photographs">
			<V11Photos />
		</Shot>
		<Shot from="somethingElse" to="pages" name="Notebook scan">
			<V12Notebook phase="intro" />
		</Shot>
		<Shot from="numbers" to="meaningless" name="Notebook – entries">
			<V12Notebook phase="scan" />
		</Shot>
		<Shot from="recognized" to="phoneNumber" name="His phone number">
			<V12Notebook phase="phone" />
		</Shot>
		<Shot from="from1987" name="Adam's own number">
			<V14OwnNumber />
		</Shot>
		<Shot from="stoppedBreathing" name="Stopped breathing">
			<V15Breath />
		</Shot>
		<Shot from="belowIt" to="date" name="SPECIAL F – ADAM RAHMAN / 1:17 / NOV 6">
			<V12Notebook phase="name" />
		</Shot>
		<Shot from="tomorrow" name="Tomorrow (calendar)">
			<V18Tomorrow />
		</Shot>
	</>
);

/** "He lived alone." – the seller's dead stare, slow push. */
const V02Alone: React.FC = () => {
	const {f, dur} = useShot();
	return (
		<Stage cam={camKeys(f, [[0, {x: 880, y: 440, zoom: 3.0}], [dur, {x: 880, y: 440, zoom: 3.6}]], EASE.linear)} overlay={<CartoonFinish vignette={0.8} />}>
			<Layer>
				<Market behindTable={<Seller x={880} y={735} scale={0.9} upperOnly expression="blank" look={[1, 0]} blink={false} />} />
			</Layer>
		</Stage>
	);
};

