import test from 'node:test'
import assert from 'node:assert/strict'
import { flattenKeys, diffKeys, stripComments, CYRILLIC } from '../validate-i18n.mjs'

test('flattenKeys returns sorted dot paths of string leaves', () => {
	assert.deepEqual(
		flattenKeys({ b: { x: '1' }, a: { subscriptions: { plan: '2' } } }),
		['a.subscriptions.plan', 'b.x'],
	)
})

test('diffKeys reports missing and extra', () => {
	const d = diffKeys(['a', 'b'], ['b', 'c'])
	assert.deepEqual(d, { missing: ['a'], extra: ['c'] })
})

test('stripComments removes // and /* */ but keeps URLs', () => {
	const src = "const u = 'https://x.ua' // Ім'я\n/* Прізвище */ const b = 1"
	const out = stripComments(src)
	assert.ok(out.includes('https://x.ua'))
	assert.ok(!CYRILLIC.test(out))
})

test('CYRILLIC matches Ukrainian-specific letters', () => {
	assert.ok(CYRILLIC.test('Ґанок'))
	assert.ok(CYRILLIC.test('є'))
	assert.ok(!CYRILLIC.test('hello'))
})
