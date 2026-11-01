#!/usr/bin/env node
// Extracts the map geometry the video needs from Natural Earth (public domain,
// via the world-atlas package) into src/data/geo.json. Each ring is clipped to
// the map window with Sutherland-Hodgman, so shapes stay correct inside it.
import {readFileSync, writeFileSync} from 'node:fs';
import {createRequire} from 'node:module';
import {feature} from 'topojson-client';

const require = createRequire(import.meta.url);
const load = (res) => {
	const topo = JSON.parse(readFileSync(require.resolve(`world-atlas/countries-${res}.json`), 'utf8'));
	return feature(topo, topo.objects.countries).features;
};

const MAPS = {
	hormuz: {res: '10m', bbox: [53.0, 23.4, 60.0, 28.6]},
	ukraine: {res: '50m', bbox: [20.5, 43.2, 42.5, 54.5]},
};

function clip(ring, [x0, y0, x1, y1]) {
	const edges = [
		(p) => p[0] >= x0, (p) => p[0] <= x1, (p) => p[1] >= y0, (p) => p[1] <= y1,
	];
	const cut = [
		(a, b) => [x0, a[1] + ((b[1] - a[1]) * (x0 - a[0])) / (b[0] - a[0])],
		(a, b) => [x1, a[1] + ((b[1] - a[1]) * (x1 - a[0])) / (b[0] - a[0])],
		(a, b) => [a[0] + ((b[0] - a[0]) * (y0 - a[1])) / (b[1] - a[1]), y0],
		(a, b) => [a[0] + ((b[0] - a[0]) * (y1 - a[1])) / (b[1] - a[1]), y1],
	];
	let out = ring;
	for (let e = 0; e < 4 && out.length; e++) {
		const input = out;
		out = [];
		for (let i = 0; i < input.length; i++) {
			const a = input[(i + input.length - 1) % input.length];
			const b = input[i];
			const ina = edges[e](a);
			const inb = edges[e](b);
			if (inb) {
				if (!ina) out.push(cut[e](a, b));
				out.push(b);
			} else if (ina) out.push(cut[e](a, b));
		}
	}
	return out;
}

const out = {};
const cache = {};
for (const [key, m] of Object.entries(MAPS)) {
	const countries = (cache[m.res] ??= load(m.res));
	out[key] = {bbox: m.bbox, countries: []};
	for (const c of countries) {
		const polys = c.geometry?.type === 'Polygon' ? [c.geometry.coordinates] : c.geometry?.type === 'MultiPolygon' ? c.geometry.coordinates : [];
		const rings = [];
		for (const poly of polys) {
			const r = clip(poly[0], m.bbox).map(([x, y]) => [+x.toFixed(3), +y.toFixed(3)]);
			const dedup = r.filter((p, i) => i === 0 || p[0] !== r[i - 1][0] || p[1] !== r[i - 1][1]);
			if (dedup.length >= 3) rings.push(dedup);
		}
		if (rings.length) out[key].countries.push({id: c.id, name: c.properties.name, rings});
	}
	if (key === 'ukraine') {
		// Natural Earth's default is de facto control; news maps (AP/Reuters) show
		// Ukraine's internationally recognised borders, so Crimea joins Ukraine.
		const ru = out[key].countries.find((c) => c.name === 'Russia');
		const ua = out[key].countries.find((c) => c.name === 'Ukraine');
		const isCrimea = (r) => r.every(([x, y]) => x > 32.2 && x < 36.8 && y > 44.2 && y < 46.3);
		ua.rings.push(...ru.rings.filter(isCrimea));
		ru.rings = ru.rings.filter((r) => !isCrimea(r));
	}
	console.log(key, out[key].countries.map((c) => `${c.name}(${c.rings.reduce((n, r) => n + r.length, 0)})`).join(', '));
}
writeFileSync(new URL('../src/data/geo.json', import.meta.url), JSON.stringify(out));
console.log('src/data/geo.json written');
