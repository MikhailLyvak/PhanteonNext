export function mulberry32(seed: number): () => number {
	let t = seed >>> 0
	return function () {
		t = (t + 0x6d2b79f5) >>> 0
		let r = t
		r = Math.imul(r ^ (r >>> 15), r | 1)
		r ^= r + Math.imul(r ^ (r >>> 7), r | 61)
		return ((r ^ (r >>> 14)) >>> 0) / 4294967296
	}
}

export function hashString(s: string): number {
	let h = 2166136261 >>> 0
	for (let i = 0; i < s.length; i++) {
		h ^= s.charCodeAt(i)
		h = Math.imul(h, 16777619) >>> 0
	}
	return h
}
