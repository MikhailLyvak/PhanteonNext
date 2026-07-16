#!/usr/bin/env node
// Validates i18n integrity. Base run: locale parity + t-keys freshness.
// --cyrillic: also fails on Cyrillic characters in src/ .ts/.tsx files
// outside src/i18n/messages/ (comments stripped), unless the path starts
// with a prefix listed in scripts/i18n-cyrillic-allowlist.txt.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generate, leafType } from './generate-t-keys.mjs'

export const CYRILLIC = /[Ѐ-ӿ]/

export function flattenKeys(node, prefix = '') {
	const out = []
	for (const [k, v] of Object.entries(node)) {
		const p = prefix ? `${prefix}.${k}` : k
		if (typeof v === 'string') out.push(p)
		else out.push(...flattenKeys(v, p))
	}
	return out.sort()
}

export function kindMismatches(uk, en, prefix = '') {
	const out = []
	for (const k of Object.keys(uk)) {
		const ukVal = uk[k]
		const enVal = en[k]
		if (enVal === undefined) continue
		const p = prefix ? `${prefix}.${k}` : k
		if (typeof ukVal === 'string' && typeof enVal === 'string') {
			const ukKind = leafType(ukVal)
			const enKind = leafType(enVal)
			if (ukKind !== enKind) out.push(`${p}: uk=${ukKind} en=${enKind}`)
		} else if (typeof ukVal === 'object' && ukVal !== null && typeof enVal === 'object' && enVal !== null) {
			out.push(...kindMismatches(ukVal, enVal, p))
		}
	}
	return out
}

export function diffKeys(ukKeys, enKeys) {
	const uk = new Set(ukKeys)
	const en = new Set(enKeys)
	return {
		missing: ukKeys.filter((k) => !en.has(k)),
		extra: enKeys.filter((k) => !uk.has(k)),
	}
}

export function stripComments(src) {
	return src
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/(^|[^:'"`\\])\/\/.*$/gm, '$1')
}

function* walk(dir) {
	for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
		const p = path.join(dir, entry.name)
		if (entry.isDirectory()) yield* walk(p)
		else if (/\.(ts|tsx)$/.test(entry.name)) yield p
	}
}

const isMain =
	process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
	const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
	const read = (f) => JSON.parse(fs.readFileSync(path.join(root, f), 'utf8'))
	const problems = []

	// 1. Parity
	const ukJson = read('src/i18n/messages/uk.json')
	const enJson = read('src/i18n/messages/en.json')
	const { missing, extra } = diffKeys(flattenKeys(ukJson), flattenKeys(enJson))
	for (const k of missing) problems.push(`missing in en.json: ${k}`)
	for (const k of extra) problems.push(`extra in en.json: ${k}`)

	// 1b. Kind-parity check
	for (const m of kindMismatches(ukJson, enJson)) problems.push(`kind mismatch: ${m}`)

	// 2. Staleness
	const fresh = generate(ukJson)
	const current = fs.readFileSync(path.join(root, 'src/i18n/t-keys.ts'), 'utf8')
	if (fresh !== current)
		problems.push('src/i18n/t-keys.ts is stale — run: npm run generate-t-keys')

	// 3. Cyrillic scan
	if (process.argv.includes('--cyrillic')) {
		const allowlist = fs
			.readFileSync(path.join(root, 'scripts/i18n-cyrillic-allowlist.txt'), 'utf8')
			.split('\n')
			.map((l) => l.trim())
			.filter((l) => l && !l.startsWith('#'))
		const messagesDir = path.join(root, 'src/i18n/messages')
		for (const file of walk(path.join(root, 'src'))) {
			if (file.startsWith(messagesDir)) continue
			const rel = path.relative(root, file)
			if (allowlist.some((p) => rel.startsWith(p))) continue
			const lines = stripComments(fs.readFileSync(file, 'utf8')).split('\n')
			lines.forEach((line, i) => {
				if (CYRILLIC.test(line)) problems.push(`${rel}:${i + 1}: ${line.trim()}`)
			})
		}
	}

	if (problems.length) {
		console.error(problems.join('\n'))
		console.error(`\nvalidate-i18n: ${problems.length} problem(s)`)
		process.exit(1)
	}
	console.log('validate-i18n: OK')
}
