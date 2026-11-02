// Fictional 1987 newspaper page. THE MORNING RECORD is invented – no real
// newspaper branding is used. Page is 1500×1950 px; place it with a camera
// transform (see DocCamera).
import React, {useId} from 'react';
import {FONT} from '../utils/fonts';
import {VictorPortrait} from './EvidencePhoto';

export const NEWSPAPER_W = 1500;
export const NEWSPAPER_H = 1950;

const body = `Police are searching for a city man who vanished from his locked apartment early Friday morning, leaving behind his wallet, his keys and his shoes.

Victor Hale, 41, a former telephone-exchange technician known to neighbors for the radio equipment that filled his third-floor apartment on Alder Street, was reported missing Saturday after he failed to collect his mail.

Officers who entered the apartment found the door locked and chained from the inside and every window latched. A meal was still on the table.

"There is no sign of a struggle and no sign that anyone left," said Sgt. R. Dunmore of the 4th Precinct. "As far as we can tell, he simply isn't there."

Neighbors described Hale as quiet and polite. "He listened to the radio all night," said one resident, who asked not to be named. "Not music. Just a woman's voice reading numbers."

A downstairs tenant told the Record she heard a faint beeping from the apartment shortly after 1 a.m. on Friday — "three beeps, like a kitchen timer" — followed by silence.

Investigators removed several notebooks and a shortwave receiver from the apartment. Police ask anyone with information to contact the 4th Precinct.`;

export const OldNewspaper: React.FC<{
	/** 0..1 yellow highlight over the headline. */
	highlightHeadline?: number;
	/** 0..1 red marker circle around Victor's name. */
	circleName?: number;
}> = ({highlightHeadline = 0, circleName = 0}) => {
	const id = useId().replace(/[^a-zA-Z0-9]/g, '');
	const paras = body.split('\n\n');
	return (
		<div
			style={{
				position: 'absolute',
				width: NEWSPAPER_W,
				height: NEWSPAPER_H,
				background: 'radial-gradient(ellipse at 30% 25%, #ece3c9 0%, #e1d4b2 55%, #c9b78e 100%)',
				color: '#1d1a16',
				boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
				overflow: 'hidden',
			}}
		>
			{/* paper fibre + stains */}
			<svg width={NEWSPAPER_W} height={NEWSPAPER_H} style={{position: 'absolute', inset: 0, mixBlendMode: 'multiply'}}>
				<defs>
					<filter id={`paper${id}`}>
						<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves={4} seed={3} />
						<feColorMatrix type="matrix" values="0 0 0 0 0.55  0 0 0 0 0.45  0 0 0 0 0.3  0 0 0 0.35 0" />
					</filter>
					<filter id={`speck${id}`}>
						<feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={1} seed={11} />
						<feColorMatrix type="matrix" values="0 0 0 0 0.2  0 0 0 0 0.18  0 0 0 0 0.15  0 0 0 -2.5 1.6" />
					</filter>
				</defs>
				<rect width="100%" height="100%" filter={`url(#paper${id})`} />
				<rect width="100%" height="100%" filter={`url(#speck${id})`} opacity={0.5} />
				<circle cx={1240} cy={1620} r={170} fill="none" stroke="rgba(120,80,30,0.25)" strokeWidth={22} />
				<line x1={0} y1={980} x2={NEWSPAPER_W} y2={970} stroke="rgba(90,70,40,0.25)" strokeWidth={6} />
			</svg>

			<div style={{position: 'absolute', inset: '60px 80px', display: 'flex', flexDirection: 'column'}}>
				{/* masthead */}
				<div style={{textAlign: 'center', fontFamily: FONT.masthead, fontSize: 150, lineHeight: 1}}>The Morning Record</div>
				<div
					style={{
						marginTop: 16,
						borderTop: '5px solid #1d1a16',
						borderBottom: '2px solid #1d1a16',
						padding: '8px 0',
						display: 'flex',
						justifyContent: 'space-between',
						fontFamily: FONT.print,
						fontSize: 26,
						letterSpacing: 2,
					}}
				>
					<span>VOL. LXII — No. 311</span>
					<span>TUESDAY, NOVEMBER 10, 1987</span>
					<span>CITY EDITION · 25 CENTS</span>
				</div>

				{/* headline */}
				<div style={{position: 'relative', marginTop: 34}}>
					<div
						style={{
							position: 'absolute',
							left: -10,
							top: 6,
							height: '92%',
							width: `${highlightHeadline * 101}%`,
							background: 'rgba(255, 226, 60, 0.55)',
							mixBlendMode: 'multiply',
						}}
					/>
					<div style={{position: 'relative', fontFamily: FONT.headline, fontWeight: 700, fontSize: 112, lineHeight: 1.02, textTransform: 'uppercase', letterSpacing: -1}}>
						Local radio enthusiast missing without trace
					</div>
				</div>
				<div style={{marginTop: 18, fontFamily: FONT.print, fontStyle: 'italic', fontSize: 40}}>
					Apartment found locked from the inside; police say “no sign of struggle”
				</div>
				<div style={{marginTop: 10, fontFamily: FONT.print, fontSize: 26, letterSpacing: 1}}>By ELLEN MARSH, Staff Writer</div>

				<div style={{display: 'flex', gap: 40, marginTop: 26, flex: 1}}>
					<div style={{flex: 2.2, display: 'flex', flexDirection: 'column'}}>
						<div style={{display: 'flex', gap: 30}}>
							<div style={{flexShrink: 0}}>
								<div style={{border: '3px solid #1d1a16'}}>
									<VictorPortrait width={400} height={500} sepia={0} blur={1.4} />
								</div>
								<div style={{width: 400, fontFamily: FONT.print, fontStyle: 'italic', fontSize: 22, marginTop: 8, lineHeight: 1.25}}>
									<span style={{position: 'relative', display: 'inline-block'}}>
										Victor Hale, 41
										{circleName > 0 && (
											<svg width={240} height={80} viewBox="0 0 240 80" style={{position: 'absolute', left: -40, top: -24, overflow: 'visible'}}>
												<path
													d="M 30 40 C 30 10 200 6 215 34 C 228 62 60 74 26 52 C 10 40 40 18 70 14"
													stroke="rgba(200,20,20,0.85)"
													strokeWidth={6}
													fill="none"
													strokeLinecap="round"
													pathLength={1}
													strokeDasharray={1}
													strokeDashoffset={1 - circleName}
												/>
											</svg>
										)}
									</span>
									, in a photograph provided by a neighbor.
								</div>
							</div>
							<div style={{fontFamily: FONT.print, fontSize: 27, lineHeight: 1.36, textAlign: 'justify', columnCount: 1}}>
								<p style={{margin: 0}}>
									<span style={{float: 'left', fontSize: 98, lineHeight: 0.8, marginRight: 8, marginTop: 6, fontWeight: 700}}>P</span>
									{paras[0].slice(1)}
								</p>
								<p style={{margin: '14px 0 0'}}>{paras[1]}</p>
								<p style={{margin: '14px 0 0'}}>{paras[2]}</p>
							</div>
						</div>
						<div style={{fontFamily: FONT.print, fontSize: 27, lineHeight: 1.36, textAlign: 'justify', columnCount: 2, columnGap: 36, marginTop: 18}}>
							{paras.slice(3).map((p, i) => (
								<p key={i} style={{margin: '0 0 14px'}}>
									{p}
								</p>
							))}
						</div>
					</div>
					<div style={{flex: 1, borderLeft: '2px solid #1d1a16', paddingLeft: 30, fontFamily: FONT.print, fontSize: 24, lineHeight: 1.35}}>
						<div style={{fontFamily: FONT.headline, fontSize: 40, fontWeight: 700, lineHeight: 1.05}}>COUNCIL DELAYS VOTE ON BUS ROUTE 9</div>
						<p style={{textAlign: 'justify'}}>
							The city council postponed a decision on the proposed extension of Route 9 after residents of the east side asked for more time to review the plan.
						</p>
						<div style={{borderTop: '2px solid #1d1a16', margin: '18px 0'}} />
						<div style={{fontFamily: FONT.headline, fontSize: 34, fontWeight: 500, lineHeight: 1.05}}>Cold snap expected through weekend</div>
						<p style={{textAlign: 'justify'}}>Overnight temperatures will fall below freezing on Saturday and Sunday, forecasters said.</p>
						<div style={{border: '3px double #1d1a16', padding: 18, marginTop: 24, textAlign: 'center'}}>
							<div style={{fontFamily: FONT.headline, fontSize: 36, fontWeight: 700}}>HARTWELL'S</div>
							<div style={{fontSize: 22, letterSpacing: 2}}>RADIO &amp; TV REPAIR</div>
							<div style={{fontSize: 20, marginTop: 8}}>Shortwave · Ham · Hi-Fi</div>
							<div style={{fontSize: 20}}>We buy estate electronics</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};
