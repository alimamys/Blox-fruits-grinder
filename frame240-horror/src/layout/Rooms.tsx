// LAYOUT GUIDES: Mara's workroom (a cramped living-room corner), the storage closet, the
// apartment block outside, and close-up inserts. Light: cold blue night from the rainy
// window against the monitor's glow on Mara's face.
import React from 'react';
import {HallThroughDoor, type HallProps} from './Hallway';
import {HandShape, MARA} from './Mara';

const WR = {
	wall: '#1c2333',
	wallLit: '#2c3448',
	floor: '#151a24',
	desk: '#4a3a2c',
	deskTop: '#5b4836',
	monitor: '#0d0f14',
	glow: '#9fc4ff',
	window: '#0f1a2c',
	rain: 'rgba(170,200,255,0.35)',
};

export type WorkView = 'wide' | 'front' | 'ots' | 'fromHall' | 'monitorAcross' | 'white';

const Rain: React.FC<{x: number; y: number; w: number; h: number; seed?: number}> = ({x, y, w, h, seed = 1}) => (
	<g>
		{Array.from({length: 46}, (_, i) => {
			const rx = x + ((i * 97 + seed * 31) % w);
			const ry = y + ((i * 53 + seed * 17) % h);
			return <line key={i} x1={rx} y1={ry} x2={rx - 3} y2={ry + 22 + (i % 5) * 6} stroke={WR.rain} strokeWidth={2} />;
		})}
		{Array.from({length: 18}, (_, i) => (
			<circle key={`d${i}`} cx={x + ((i * 131) % w)} cy={y + ((i * 71) % h)} r={3 + (i % 3)} fill="rgba(190,215,255,0.35)" />
		))}
	</g>
);

/** Computer monitor. `screen` is drawn inside the 16:9 screen box (x, y, w, h). */
export const Monitor: React.FC<{x: number; y: number; w: number; screen?: React.ReactNode; glow?: string; cracked?: boolean; angle?: number}> = ({x, y, w, screen, glow = WR.glow, cracked = false, angle = 0}) => {
	const h = (w * 9) / 16;
	return (
		<g transform={`rotate(${angle} ${x + w / 2} ${y + h / 2})`}>
			<rect x={x + w / 2 - w * 0.06} y={y + h} width={w * 0.12} height={h * 0.28} fill="#22252c" />
			<rect x={x + w / 2 - w * 0.22} y={y + h + h * 0.26} width={w * 0.44} height={h * 0.05} rx={6} fill="#2a2d35" />
			<rect x={x - 12} y={y - 12} width={w + 24} height={h + 24} rx={10} fill={WR.monitor} stroke="#000" strokeWidth={3} />
			<svg x={x} y={y} width={w} height={h} viewBox="0 0 1920 1080" preserveAspectRatio="none">
				<rect x={0} y={0} width={1920} height={1080} fill={glow} />
				{screen}
			</svg>
			{cracked ? (
				<g stroke="rgba(255,255,255,0.85)" strokeWidth={2.5} fill="none">
					<path d={`M${x + w * 0.42},${y + h * 0.48} l${-w * 0.2},${-h * 0.3} M${x + w * 0.42},${y + h * 0.48} l${w * 0.3},${-h * 0.2} M${x + w * 0.42},${y + h * 0.48} l${w * 0.12},${h * 0.45} M${x + w * 0.42},${y + h * 0.48} l${-w * 0.28},${h * 0.3} M${x + w * 0.42},${y + h * 0.48} l${w * 0.48},${h * 0.1}`} />
				</g>
			) : null}
		</g>
	);
};

const Desk: React.FC<{x: number; y: number; w: number; h?: number}> = ({x, y, w, h = 36}) => (
	<g>
		<rect x={x} y={y} width={w} height={h} fill={WR.deskTop} stroke="#000" strokeWidth={3} />
		<rect x={x + 20} y={y + h} width={26} height={1080 - y} fill={WR.desk} />
		<rect x={x + w - 46} y={y + h} width={26} height={1080 - y} fill={WR.desk} />
	</g>
);

/** Office chair seen from the side (seat at x, y). */
export const Chair: React.FC<{x: number; y: number; s?: number; back?: 'L' | 'R' | 'behind'}> = ({x, y, s = 1, back = 'L'}) => (
	<g>
		<rect x={x - 110 * s} y={y} width={220 * s} height={30 * s} rx={10} fill="#202329" stroke="#000" strokeWidth={3} />
		<rect x={x - 8 * s} y={y + 30 * s} width={16 * s} height={150 * s} fill="#2b2e35" />
		<path d={`M${x - 130 * s},${y + 200 * s} L${x + 130 * s},${y + 200 * s}`} stroke="#2b2e35" strokeWidth={14 * s} strokeLinecap="round" />
		{back === 'behind' ? (
			<rect x={x - 120 * s} y={y - 330 * s} width={240 * s} height={320 * s} rx={30} fill="#1b1d22" stroke="#000" strokeWidth={3} />
		) : (
			<rect x={back === 'L' ? x - 130 * s : x + 100 * s} y={y - 300 * s} width={34 * s} height={300 * s} rx={12} fill="#1b1d22" stroke="#000" strokeWidth={3} />
		)}
	</g>
);

/**
 * The workroom.
 *  wide          - side view: desk + monitor on the right, Mara's chair centre, the open
 *                  doorway to the dark hallway behind her (left), rainy window above the desk
 *  front         - from the monitor: Mara faces the camera; the doorway is behind her
 *  ots           - over her shoulder: the monitor fills the right of the frame
 *  fromHall      - from deep in the hallway: her back at the desk through the doorway
 *  monitorAcross - the monitor glowing across the dark room
 */
export const Workroom: React.FC<{
	view: WorkView;
	screen?: React.ReactNode;
	hall?: HallProps;
	drained?: number;
	cracked?: boolean;
	children?: React.ReactNode;
	glow?: string;
}> = ({view, screen, hall = {light: 'night'}, drained = 0, cracked = false, children, glow}) => {
	if (view === 'wide') {
		return (
			<g>
				<rect x={0} y={0} width={1920} height={1080} fill={WR.wall} />
				<rect x={0} y={820} width={1920} height={260} fill={WR.floor} />
				{/* doorway to the hallway, behind her (left) */}
				<rect x={150} y={210} width={330} height={610} fill="#06080d" stroke="#2a2f3a" strokeWidth={18} />
				<polygon points="160,820 470,820 380,600 250,600" fill="#0b0e15" />
				{/* window with rain above the desk */}
				<rect x={1180} y={130} width={560} height={420} fill={WR.window} stroke="#33394a" strokeWidth={14} />
				<line x1={1460} y1={130} x2={1460} y2={550} stroke="#33394a" strokeWidth={10} />
				<Rain x={1190} y={140} w={540} h={400} />
				<Desk x={1060} y={640} w={800} />
				<Monitor x={1360} y={360} w={420} screen={screen} angle={0} glow={glow} />
				<rect x={1180} y={612} width={220} height={22} rx={4} fill="#2a2d35" />
				<ellipse cx={1290} cy={630} rx={70} ry={10} fill="#1d1f24" />
				<rect x={1640} y={588} width={44} height={52} rx={6} fill="#c9c3b8" />
				{children}
				<rect x={0} y={0} width={1920} height={1080} fill="#e9e8e3" opacity={drained} />
			</g>
		);
	}
	if (view === 'front') {
		return (
			<g>
				<rect x={0} y={0} width={1920} height={1080} fill={WR.wall} />
				{/* the open doorway behind her, slightly off-centre left, black */}
				<HallThroughDoor {...hall} wall={WR.wall} />
				<rect x={0} y={860} width={1920} height={220} fill={WR.floor} opacity={0.6} />
				{children}
				{/* monitor glow from the camera side */}
				<rect x={0} y={0} width={1920} height={1080} fill={glow ?? WR.glow} opacity={0.06} />
				<rect x={0} y={0} width={1920} height={1080} fill="#e9e8e3" opacity={drained} />
			</g>
		);
	}
	if (view === 'ots') {
		return (
			<g>
				<rect x={0} y={0} width={1920} height={1080} fill={WR.wall} />
				<rect x={1000} y={40} width={900} height={600} fill={WR.window} stroke="#33394a" strokeWidth={14} />
				<Rain x={1010} y={50} w={880} h={580} seed={3} />
				<Desk x={300} y={850} w={1700} />
				<Monitor x={620} y={170} w={1080} screen={screen} glow={glow} cracked={cracked} />
				{children}
				<rect x={0} y={0} width={1920} height={1080} fill="#e9e8e3" opacity={drained} />
			</g>
		);
	}
	if (view === 'fromHall') {
		return (
			<g>
				<rect x={0} y={0} width={1920} height={1080} fill="#07090e" />
				{/* the lit workroom seen through the doorway */}
				<rect x={640} y={220} width={640} height={720} fill="#1c2333" />
				<rect x={640} y={760} width={640} height={180} fill="#141924" />
				<Desk x={720} y={690} w={480} h={24} />
				<Monitor x={850} y={470} w={300} screen={screen} glow={glow} />
				<ellipse cx={1000} cy={600} rx={260} ry={200} fill={glow ?? WR.glow} opacity={0.12} />
				{children}
				{/* hallway walls in the dark foreground */}
				<polygon points="0,0 640,220 640,940 0,1080" fill="#0c0f16" />
				<polygon points="1920,0 1280,220 1280,940 1920,1080" fill="#0a0d13" />
				<polygon points="0,1080 640,940 1280,940 1920,1080" fill="#100f0f" />
				<polygon points="700,1080 860,940 1060,940 1220,1080" fill="#2a2219" opacity={0.6} />
			</g>
		);
	}
	if (view === 'monitorAcross') {
		return (
			<g>
				<rect x={0} y={0} width={1920} height={1080} fill="#080a10" />
				<rect x={0} y={760} width={1920} height={320} fill="#0b0d12" />
				<Desk x={620} y={640} w={760} h={26} />
				<Monitor x={760} y={340} w={480} screen={screen} glow={glow} cracked={cracked} />
				<ellipse cx={1000} cy={520} rx={500} ry={340} fill={glow ?? WR.glow} opacity={0.08} />
				<rect x={1440} y={120} width={380} height={380} fill="#0c1424" stroke="#1e2433" strokeWidth={10} />
				<Rain x={1450} y={130} w={360} h={360} seed={5} />
				{children}
			</g>
		);
	}
	// white: the workroom drained into an unfinished drawing - flat white, faint outlines
	return (
		<g>
			<rect x={0} y={0} width={1920} height={1080} fill="#efeee9" />
			<g fill="none" stroke="rgba(80,80,90,0.25)" strokeWidth={2}>
				<rect x={150} y={210} width={330} height={610} />
				<rect x={1180} y={130} width={560} height={420} />
				<line x1={0} y1={820} x2={1920} y2={820} />
				<rect x={1060} y={640} width={800} height={36} />
				<rect x={1348} y={348} width={444} height={260} />
			</g>
			{children}
		</g>
	);
};

export type ClosetView = 'wide' | 'door' | 'gap' | 'top' | 'face';

/**
 * The storage closet: tiny, white walls, shelves with boxes, a vacuum and coats on hooks,
 * a white door with a thin gap of light beneath it. Her phone is the only light.
 */
export const Closet: React.FC<{view: ClosetView; children?: React.ReactNode; dent?: number; face?: number; bulge?: number}> = ({view, children, dent = 0, face = 0, bulge = 0}) => {
	const dark = 'rgba(0,0,0,0.78)';
	if (view === 'wide') {
		return (
			<g>
				<rect x={0} y={0} width={1920} height={1080} fill="#d9d8d2" />
				{/* shelves and boxes on the left */}
				{[200, 420, 640].map((y) => (
					<g key={y}>
						<rect x={0} y={y} width={620} height={18} fill="#a49c8c" />
						<rect x={40} y={y - 120} width={170} height={120} fill="#b08a5c" stroke="#000" strokeWidth={2} />
						<rect x={240} y={y - 90} width={140} height={90} fill="#9b7b52" stroke="#000" strokeWidth={2} />
					</g>
				))}
				{/* coats on hooks, back wall */}
				<path d="M700,120 q-60,180 -30,520 l140,0 q30,-340 -40,-520 Z" fill="#4a5568" />
				<path d="M860,120 q-50,200 -20,480 l120,0 q20,-300 -30,-480 Z" fill="#6b4f3a" />
				{/* vacuum */}
				<rect x={1500} y={520} width={60} height={360} fill="#5d6470" />
				<ellipse cx={1530} cy={900} rx={90} ry={40} fill="#3d434d" />
				{/* the white door on the right, with the gap of light */}
				<rect x={1620} y={60} width={300} height={960} fill="#e6e5df" stroke="#999" strokeWidth={4} />
				<rect x={1620} y={1016} width={300} height={8} fill="#f7f1d8" />
				<circle cx={1650} cy={560} r={12} fill="#b8b6ad" />
				<rect x={0} y={880} width={1920} height={200} fill="#bdbab2" />
				{children}
				<rect x={0} y={0} width={1920} height={1080} fill={dark} />
				{/* her phone light */}
				<ellipse cx={960} cy={600} rx={420} ry={360} fill="#d9e8ff" opacity={0.28} />
			</g>
		);
	}
	if (view === 'door') {
		return (
			<g>
				<rect x={0} y={0} width={1920} height={1080} fill="#cfcec8" />
				<rect x={460} y={0} width={1000} height={1060} fill="#ebeae4" stroke="#9a9a94" strokeWidth={5} />
				<rect x={460} y={1056} width={1000} height={10} fill="#fbf4d8" />
				<circle cx={540} cy={600} r={22} fill="#bdbbb2" stroke="#888" strokeWidth={2} />
				{/* a dent by the handle */}
				{dent > 0 ? <ellipse cx={600} cy={560} rx={70 * dent} ry={90 * dent} fill="rgba(0,0,0,0.12)" stroke="rgba(0,0,0,0.25)" strokeWidth={2} /> : null}
				{/* a face pressing through from the other side */}
				{face > 0 ? (
					<g opacity={face} fill="none" stroke="rgba(60,60,70,0.55)" strokeWidth={3}>
						<ellipse cx={960} cy={430} rx={150} ry={200} />
						<ellipse cx={905} cy={400} rx={30} ry={18} />
						<ellipse cx={1015} cy={400} rx={30} ry={18} />
						<path d="M960,430 l-12,60 l22,0" />
						<path d="M910,540 q50,20 100,0" />
						<ellipse cx={960} cy={430} rx={150} ry={200} fill="rgba(0,0,0,0.06)" stroke="none" />
					</g>
				) : null}
				{bulge > 0 ? <ellipse cx={960} cy={480} rx={330 * bulge} ry={420 * bulge} fill="rgba(0,0,0,0.1)" stroke="rgba(0,0,0,0.2)" strokeWidth={3} /> : null}
				{children}
				<rect x={0} y={0} width={1920} height={1080} fill="rgba(0,0,0,0.55)" />
				<ellipse cx={960} cy={560} rx={700} ry={520} fill="#dfeaff" opacity={0.22} />
			</g>
		);
	}
	if (view === 'gap') {
		return (
			<g>
				<rect x={0} y={0} width={1920} height={1080} fill="#2a2a2c" />
				<rect x={0} y={0} width={1920} height={760} fill="#d9d8d2" />
				<rect x={0} y={760} width={1920} height={30} fill="#fff6d6" />
				<rect x={0} y={790} width={1920} height={290} fill="#4a4741" />
				{children}
				<rect x={0} y={0} width={1920} height={1080} fill="rgba(0,0,0,0.62)" />
				<rect x={0} y={754} width={1920} height={42} fill="#fff3c8" opacity={0.55} />
			</g>
		);
	}
	if (view === 'top') {
		return (
			<g>
				<rect x={0} y={0} width={1920} height={1080} fill="#bdbab2" />
				<rect x={0} y={0} width={1920} height={110} fill="#d9d8d2" />
				<rect x={0} y={0} width={180} height={1080} fill="#d9d8d2" />
				<rect x={1740} y={0} width={180} height={1080} fill="#e6e5df" />
				<rect x={210} y={130} width={240} height={160} fill="#b08a5c" stroke="#000" strokeWidth={2} />
				<rect x={1480} y={760} width={140} height={140} rx={60} fill="#3d434d" />
				{children}
				<rect x={0} y={0} width={1920} height={1080} fill="rgba(0,0,0,0.6)" />
				<ellipse cx={960} cy={560} rx={380} ry={320} fill="#d9e8ff" opacity={0.3} />
			</g>
		);
	}
	// face: a close-up backdrop - white closet wall behind her, dark
	return (
		<g>
			<rect x={0} y={0} width={1920} height={1080} fill="#cfcec8" />
			<rect x={1500} y={0} width={420} height={1080} fill="#e3e2dc" />
			{children}
			<rect x={0} y={0} width={1920} height={1080} fill="rgba(0,0,0,0.7)" style={{mixBlendMode: 'multiply'}} />
		</g>
	);
};

/** Outside: a modest apartment block at night in the rain, one lit window (hers). */
export const Exterior: React.FC = () => (
	<g>
		<rect x={0} y={0} width={1920} height={1080} fill="#0a0f1a" />
		<rect x={360} y={120} width={1200} height={960} fill="#1a1f2a" stroke="#000" strokeWidth={3} />
		{Array.from({length: 4}, (_, r) =>
			Array.from({length: 5}, (_, c) => {
				const lit = r === 1 && c === 3;
				return <rect key={`${r}${c}`} x={430 + c * 225} y={190 + r * 220} width={140} height={150} fill={lit ? '#9fc0ff' : '#0d121c'} stroke="#2b3140" strokeWidth={6} />;
			}),
		)}
		<ellipse cx={1170} cy={485} rx={160} ry={140} fill="#9fc0ff" opacity={0.14} />
		<Rain x={0} y={0} w={1920} h={1080} seed={7} />
		<rect x={0} y={1000} width={1920} height={80} fill="#06080c" />
	</g>
);

/** Close-up wall surface (hallway). */
export const WallClose: React.FC<{
	tone?: 'dark' | 'flash' | 'flat' | 'white';
	pencilLine?: number;
	redLine?: boolean;
	outline?: number;
	shape?: 'none' | 'shoulder' | 'body' | 'hand' | 'elbow' | 'head' | 'stretched';
	rake?: boolean;
	fingertip?: boolean;
	photo?: boolean;
}> = ({tone = 'dark', pencilLine = 0, redLine = false, outline = 0, shape = 'none', rake = false, fingertip = false, photo = false}) => {
	const base = {dark: '#2b3346', flash: '#d8d6cf', flat: '#e4e2dc', white: '#eeede8'}[tone];
	const s = 'rgba(60,60,70,' + (0.2 + outline * 0.4) + ')';
	const shapes: Record<string, React.ReactNode> = {
		none: null,
		shoulder: <path d="M560,1080 Q600,640 900,560 Q1100,520 1220,600" fill="none" stroke={s} strokeWidth={5} />,
		body: <path d="M700,1080 Q640,700 820,560 Q900,420 960,300 Q1020,420 1100,560 Q1280,700 1220,1080" fill="rgba(0,0,0,0.04)" stroke={s} strokeWidth={4} />,
		hand: <path d="M900,120 l10,140 l30,0 l-6,-150 M950,110 l6,150 M990,115 l0,150 M1030,130 l-8,140 M1060,200 l-30,90" fill="none" stroke={s} strokeWidth={5} />,
		elbow: <path d="M500,300 Q760,420 980,380 Q1150,360 1300,500" fill="none" stroke={s} strokeWidth={5} />,
		head: <ellipse cx={960} cy={520} rx={170} ry={210} fill="rgba(0,0,0,0.04)" stroke={s} strokeWidth={5} transform="rotate(25 960 520)" />,
		stretched: <path d="M200,700 Q600,620 960,640 Q1400,660 1760,560" fill="none" stroke={s} strokeWidth={6} />,
	};
	return (
		<g>
			<rect x={0} y={0} width={1920} height={1080} fill={base} />
			{tone !== 'white' && tone !== 'flat'
				? [180, 520, 860, 1200, 1540, 1880].map((x) => <line key={x} x1={x} y1={0} x2={x} y2={1080} stroke="rgba(0,0,0,0.08)" strokeWidth={6} />)
				: null}
			{photo ? <rect x={0} y={0} width={1920} height={1080} fill="url(#none)" stroke="none" /> : null}
			{shapes[shape]}
			{pencilLine > 0 ? <path d={`M760,560 L${760 + 520 * pencilLine},${560 + 30 * pencilLine}`} stroke="#0a0a0a" strokeWidth={5} strokeLinecap="round" /> : null}
			{redLine ? <line x1={0} y1={520} x2={1920} y2={560} stroke="#d0141c" strokeWidth={22} strokeLinecap="round" /> : null}
			{fingertip ? <HandShape p={[1260, 700]} a={-75} s={4.2} /> : null}
			{rake ? <rect x={0} y={0} width={1920} height={1080} fill="url(#rake)" /> : null}
			{tone === 'dark' ? <rect x={0} y={0} width={1920} height={1080} fill="rgba(4,6,12,0.45)" /> : null}
			{tone === 'flash' ? <ellipse cx={960} cy={540} rx={900} ry={600} fill="#fff" opacity={0.15} /> : null}
		</g>
	);
};

/** Desk inserts (close-ups on objects and hands). */
export const DeskInsert: React.FC<{
	kind: 'phoneMug' | 'stylus' | 'spacebar' | 'keyboard' | 'keys' | 'click' | 'hands' | 'phoneFloor';
	glow?: string;
	press?: number;
	shake?: number;
}> = ({kind, glow = '#9fc4ff', press = 0}) => {
	const desk = (
		<>
			<rect x={0} y={0} width={1920} height={1080} fill="#2a2119" />
			<rect x={0} y={0} width={1920} height={1080} fill={glow} opacity={0.08} />
		</>
	);
	if (kind === 'phoneMug') {
		return (
			<g>
				{desk}
				<rect x={520} y={480} width={330} height={620} rx={40} fill="#141519" stroke="#000" strokeWidth={4} transform="rotate(-12 685 790)" />
				<ellipse cx={1290} cy={720} rx={210} ry={90} fill="#d9d4ca" />
				<rect x={1080} y={420} width={420} height={300} fill="#d9d4ca" />
				<ellipse cx={1290} cy={420} rx={210} ry={70} fill="#3a2414" stroke="#d9d4ca" strokeWidth={16} />
				<path d="M1500,480 q120,20 110,120 q-10,90 -110,100" stroke="#d9d4ca" strokeWidth={34} fill="none" />
				<rect x={1500} y={60} width={420} height={380} fill="#0f1a2c" />
				<Rain x={1510} y={70} w={400} h={360} seed={9} />
			</g>
		);
	}
	if (kind === 'stylus' || kind === 'hands') {
		return (
			<g>
				{desk}
				<rect x={260} y={420} width={1400} height={760} rx={30} fill="#1a1b20" stroke="#000" strokeWidth={4} />
				<rect x={330} y={480} width={1260} height={640} rx={14} fill="#25272e" />
				<rect x={1060} y={-40} width={170} height={330} rx={60} fill={MARA.skin} transform="rotate(18 1145 120)" />
				<HandShape p={[1060, 250]} a={14} s={7} grip={kind === 'stylus'} />
				{kind === 'stylus' ? <line x1={1060} y1={330} x2={930} y2={780} stroke="#101010" strokeWidth={26} strokeLinecap="round" /> : null}
				{kind === 'hands' ? (
					<>
						<rect x={560} y={-40} width={170} height={330} rx={60} fill={MARA.skin} transform="rotate(-18 645 120)" />
						<HandShape p={[660, 250]} a={-14} s={7} />
					</>
				) : null}
			</g>
		);
	}
	if (kind === 'spacebar' || kind === 'keyboard') {
		return (
			<g>
				{desk}
				<rect x={120} y={300} width={1680} height={900} rx={30} fill="#1d1f24" stroke="#000" strokeWidth={4} />
				{Array.from({length: 3}, (_, r) =>
					Array.from({length: 11}, (_, c) => <rect key={`${r}${c}`} x={170 + c * 148} y={340 + r * 150} width={128} height={128} rx={14} fill="#2d3038" stroke="#111" strokeWidth={3} />),
				)}
				<rect x={520} y={800 + press * 10} width={880} height={130} rx={16} fill="#33363f" stroke="#111" strokeWidth={4} />
				<HandShape p={[960, 300 + press * 40]} a={0} s={7} />
			</g>
		);
	}
	if (kind === 'keys') {
		return (
			<g>
				{desk}
				<circle cx={900} cy={720} r={70} fill="none" stroke="#c9c9c9" strokeWidth={14} />
				<rect x={940} y={700} width={240} height={46} rx={10} fill="#bdbdbd" />
				<rect x={860} y={760} width={60} height={200} rx={10} fill="#a7a7a7" transform="rotate(30 890 860)" />
				<HandShape p={[920, 200 + press * 250]} a={0} s={7} grip={press > 0.5} />
			</g>
		);
	}
	if (kind === 'click') {
		return (
			<g>
				{desk}
				<ellipse cx={960} cy={740} rx={210} ry={300} fill="#1c1d22" stroke="#000" strokeWidth={4} />
				<line x1={960} y1={450} x2={960} y2={640} stroke="#000" strokeWidth={4} />
				<HandShape p={[960, 260]} a={0} s={6.5} />
			</g>
		);
	}
	// phone face up on the floor, glowing
	return (
		<g>
			<rect x={0} y={0} width={1920} height={1080} fill="#d9d8d2" />
			<rect x={0} y={0} width={1920} height={1080} fill="rgba(0,0,0,0.55)" />
			<rect x={760} y={360} width={420} height={760} rx={50} fill="#141519" stroke="#000" strokeWidth={4} transform="rotate(18 970 740)" />
			<rect x={790} y={400} width={360} height={680} rx={30} fill="#dfe9ff" opacity={0.85} transform="rotate(18 970 740)" />
			<ellipse cx={970} cy={740} rx={520} ry={380} fill="#dfe9ff" opacity={0.15} />
		</g>
	);
};

export {MARA};
