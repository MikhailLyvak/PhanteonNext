# i18n (uk/en, next-intl) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Internationalize all hardcoded user-facing text in PhanteonNext into `uk` (default) + `en` using next-intl with a typed house-pattern wrapper, per the approved spec `docs/superpowers/specs/2026-07-10-i18n-design.md`.

**Architecture:** All routes move under `src/app/[locale]/` with next-intl middleware (`localePrefix: 'as-needed'` — existing unprefixed URLs keep serving Ukrainian). Translations live in `src/i18n/messages/{uk,en}.json`; a generator emits a typed key tree (`t-keys.ts`) where plain messages are `string` leaves, ICU-parameterized messages are functions, and rich-text messages are tag-renderer functions. Components consume translations only through `useCustomTranslations` / `getCustomTranslations`.

**Tech Stack:** Next.js 16.1.4 (App Router, Turbopack dev), React 19, next-intl ^4, Zod 3, react-hook-form, TypeScript 5. Scripts: plain Node 22 ESM (`.mjs`) tested with built-in `node:test` — no new test framework.

## Global Constraints

- Locales: `uk` (default, source language) + `en`. `localePrefix: 'as-needed'` (uk unprefixed, en under `/en`).
- Always `TKeys.x.y`, never string namespace paths.
- No fallback values — `t.key || '…'` is forbidden; `validate-i18n` guarantees presence.
- No passing translated strings as props — every component calls the hook itself.
- Every new key goes to **both** `uk.json` and `en.json` in the same commit; `uk` values are the existing hardcoded strings **verbatim**; `en` values are drafted matching the marketing voice (trading/crypto product) and reviewed later as a single-file sweep.
- Key names: descriptive camelCase (`saveChanges`, `noActiveSubscriptions`).
- Count-based messages MUST use ICU plural with Ukrainian categories `one`/`few`/`many`/`other`. Never concatenate plurals.
- After any key change: `npm run generate-t-keys && npm run validate-i18n`.
- `src/app/api/`, `src/app/screener-proxy/` and the `/tron-proxy` rewrite are never localized; middleware matcher excludes them.
- Route handlers/`redirect()` path strings stay unprefixed (`'/login'`) — the locale-aware navigation wrappers add prefixes.
- Out of scope: dynamic backend content (blog posts, webinar data, study-platform content, API payloads), decorative alt text, console/log strings, code comments. Numeric price/balance formatting stays `en-US` (`src/lib/screener/format.ts`, `BalanceCard.tsx`) — deliberate.
- Package manager: `yarn` (v1.22). Type check: `npx tsc --noEmit`. Build: `yarn build`.
- Commit after every task. Repo style: `feat(i18n): …` / `fix(i18n): …` / `test(i18n): …`.
- The repo has no React test runner. Scripts are TDD'd with `node:test`; React-side changes are verified by `npx tsc --noEmit`, `yarn build`, and the smoke steps inside each task.

## Migration state tracking

Tasks 10–19 migrate features. Until Task 21 flips the permanent Cyrillic gate on, run the base `npm run validate-i18n` (parity + staleness only). `npm run validate-i18n:full` is expected to fail until all migration tasks are done.

Namespace map (fixed — do not invent new top-level namespaces):

| Namespace | Source files |
|---|---|
| `common`, `nav` | `[locale]/components/LayoutItems`, `HeaderComps`, `UI`, `Buttons`, `Shop`, `LatestWebinar.tsx` |
| `home` | `[locale]/page.tsx`, `[locale]/components/HomePage/*` |
| `auth` | `[locale]/components/Auth/*`, `[locale]/login`, `[locale]/forgotPassword`, `[locale]/reset-password` |
| `about`, `privacy`, `contacts`, `webinars`, `blog` | respective route dirs + `[locale]/components/Blog` |
| `notFound` | `[locale]/not-found.tsx` (+ legacy `404page`) |
| `paywall`, `payments` | `[locale]/paywall`, `[locale]/payments`, `[locale]/payment-result` |
| `cabinet.personalData`, `.subscriptions`, `.certificates`, `.settings`, `.webinars`, `.studyPlatform` | `[locale]/myCabinet/*` |
| `screener` | `[locale]/components/Screener`, `[locale]/myCabinet/screener` |
| `tradingBots` | `[locale]/myCabinet/tradingBots`, errors from `src/hooks/TradingBots/useAlgonixSession.ts` |
| `aiAgent`, `tradingChat` | `[locale]/AI-Agent`, `[locale]/Trading-Chat` |
| `validation`, `errors`, `meta` | cross-cutting: Zod messages, API/hook error mapping, metadata |

---

### Task 1: Install next-intl and scaffold i18n config

**Files:**
- Modify: `package.json` (dependency)
- Create: `src/i18n/routing.ts`
- Create: `src/i18n/request.ts`
- Create: `src/i18n/navigation.ts`
- Create: `src/i18n/messages/uk.json`
- Create: `src/i18n/messages/en.json`
- Modify: `next.config.ts`

**Interfaces:**
- Produces: `routing` (`defineRouting` result; `locales: ['uk','en']`, `defaultLocale: 'uk'`, `localePrefix: 'as-needed'`), locale-aware `Link`, `redirect`, `usePathname`, `useRouter`, `getPathname` from `@/i18n/navigation`. Message files consumed by every later task.

- [ ] **Step 1: Install next-intl**

```bash
yarn add next-intl
```

Expected: `next-intl@^4` appears in `package.json` dependencies.

- [ ] **Step 2: Create `src/i18n/routing.ts`**

```ts
import { defineRouting } from 'next-intl/routing'

export const routing = defineRouting({
	locales: ['uk', 'en'],
	defaultLocale: 'uk',
	localePrefix: 'as-needed',
})

export type AppLocale = (typeof routing.locales)[number]
```

- [ ] **Step 3: Create `src/i18n/request.ts`**

```ts
import { getRequestConfig } from 'next-intl/server'
import { hasLocale } from 'next-intl'
import { routing } from './routing'

export default getRequestConfig(async ({ requestLocale }) => {
	const requested = await requestLocale
	const locale = hasLocale(routing.locales, requested)
		? requested
		: routing.defaultLocale

	return {
		locale,
		messages: (await import(`./messages/${locale}.json`)).default,
	}
})
```

- [ ] **Step 4: Create `src/i18n/navigation.ts`**

```ts
import { createNavigation } from 'next-intl/navigation'
import { routing } from './routing'

export const { Link, redirect, usePathname, useRouter, getPathname } =
	createNavigation(routing)
```

- [ ] **Step 5: Seed message files**

`src/i18n/messages/uk.json`:

```json
{
	"common": {
		"loading": "Завантаження…"
	}
}
```

`src/i18n/messages/en.json`:

```json
{
	"common": {
		"loading": "Loading…"
	}
}
```

- [ ] **Step 6: Wire the next-intl plugin in `next.config.ts`**

Replace the file's first line and export (keep `sassOptions`, `images`, `rewrites` untouched):

```ts
import type { NextConfig } from "next";
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin() // defaults to ./src/i18n/request.ts

const nextConfig: NextConfig = {
	// … existing config unchanged …
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 7: Verify build still passes (no middleware yet, app untouched)**

```bash
npx tsc --noEmit && yarn build
```

Expected: PASS (routes unchanged; plugin is inert until messages are used).

- [ ] **Step 8: Commit**

```bash
git add package.json yarn.lock src/i18n next.config.ts
git commit -m "feat(i18n): add next-intl, routing/request/navigation config, seed messages"
```

---

### Task 2: t-keys generator script (TDD)

**Files:**
- Create: `scripts/generate-t-keys.mjs`
- Test: `scripts/__tests__/generate-t-keys.test.mjs`
- Modify: `package.json` (scripts), `eslint.config.mjs` (ignore generated file)
- Generates: `src/i18n/t-keys.ts`

**Interfaces:**
- Consumes: `src/i18n/messages/uk.json` (Task 1).
- Produces: exported pure functions `leafType(message) -> 'plain'|'args'|'rich'`, `isNamespace(node) -> boolean`, `buildTKeys(node) -> object`, `collectNamespaces(node) -> [path, node][]`, `generate(messages) -> string`. Generated `src/i18n/t-keys.ts` exports: `TKeys` (const literal tree; namespace nodes are dot-path strings), `interface MessageShapes` (per-namespace shapes: `string` | `(values: TranslationValues) => string` | `(values: RichValues) => ReactNode`), `type Namespace = keyof MessageShapes`, `type TranslationValues`, `type RichValues`.

Classification rules (build-time, mirrored at runtime by Task 4):
- A JSON node is a **namespace** if any direct child value is a string; otherwise it's a **group** (recurse). Sub-objects inside a namespace stay part of that namespace's shape (accessed via `t.filters.price`).
- Leaf kinds: rich if `/<[a-zA-Z][^>]*>/` matches; else parameterized if `/\{\s*[0-9a-zA-Z_]+/` matches; else plain. (ICU-escaped literal braces `'{'` would misclassify — don't use literal braces in copy.)

- [ ] **Step 1: Write the failing tests** — `scripts/__tests__/generate-t-keys.test.mjs`:

```js
import test from 'node:test'
import assert from 'node:assert/strict'
import { leafType, buildTKeys, generate } from '../generate-t-keys.mjs'

test('leafType classifies plain / args / rich', () => {
	assert.equal(leafType('Зберегти'), 'plain')
	assert.equal(leafType('Мінімум {count} символів'), 'args')
	assert.equal(
		leafType('{count, plural, one {# файл} few {# файли} many {# файлів} other {# файла}}'),
		'args',
	)
	assert.equal(leafType('Згоден з <link>умовами</link>'), 'rich')
})

test('buildTKeys: namespaces become dot-path strings, groups recurse', () => {
	const messages = {
		common: { save: 'Зберегти' },
		cabinet: { subscriptions: { monthlyPlan: 'Місячний план' } },
	}
	assert.deepEqual(buildTKeys(messages), {
		common: 'common',
		cabinet: { subscriptions: 'cabinet.subscriptions' },
	})
})

test('namespace with nested sub-object stays one namespace', () => {
	const messages = {
		screener: { title: 'Скринер', filters: { price: 'Ціна' } },
	}
	assert.deepEqual(buildTKeys(messages), { screener: 'screener' })
	const src = generate(messages)
	assert.match(src, /'screener': \{/)
	assert.match(src, /filters: \{/)
})

test('generate emits string / callable / rich leaf types', () => {
	const src = generate({
		validation: {
			required: "Обов'язкове поле",
			minChars: 'Мінімум {count} символів',
			consent: 'Згоден з <link>умовами</link>',
		},
	})
	assert.match(src, /required: string/)
	assert.match(src, /minChars: \(values: TranslationValues\) => string/)
	assert.match(src, /consent: \(values: RichValues\) => ReactNode/)
	assert.match(src, /export type Namespace = keyof MessageShapes/)
})
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
node --test scripts/
```

Expected: FAIL — `Cannot find module '../generate-t-keys.mjs'`.

- [ ] **Step 3: Implement `scripts/generate-t-keys.mjs`**

```js
#!/usr/bin/env node
/**
 * Generates src/i18n/t-keys.ts from src/i18n/messages/uk.json.
 * uk.json is the source of truth; never hand-edit t-keys.ts.
 *
 * Classification (mirrored at runtime by src/lib/contexts/translations/wrap.ts):
 *  - rich:  message contains a tag like <link>…</link>  -> (values: RichValues) => ReactNode
 *  - args:  message contains an ICU argument {name}     -> (values: TranslationValues) => string
 *  - plain: everything else                              -> string
 * A JSON node is a namespace if any direct child is a string; otherwise a group.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ICU_ARGS = /\{\s*[0-9a-zA-Z_]+/
const RICH_TAG = /<[a-zA-Z][^>]*>/

export function leafType(message) {
	if (RICH_TAG.test(message)) return 'rich'
	if (ICU_ARGS.test(message)) return 'args'
	return 'plain'
}

export function isNamespace(node) {
	return Object.values(node).some((v) => typeof v === 'string')
}

export function buildTKeys(node, prefix = '') {
	const out = {}
	for (const [k, v] of Object.entries(node)) {
		if (typeof v === 'string') continue
		const p = prefix ? `${prefix}.${k}` : k
		out[k] = isNamespace(v) ? p : buildTKeys(v, p)
	}
	return out
}

export function collectNamespaces(node, prefix = '') {
	const out = []
	for (const [k, v] of Object.entries(node)) {
		if (typeof v === 'string') continue
		const p = prefix ? `${prefix}.${k}` : k
		if (isNamespace(v)) out.push([p, v])
		else out.push(...collectNamespaces(v, p))
	}
	return out
}

const identRe = /^[A-Za-z_$][A-Za-z0-9_$]*$/

function serializeTKeys(node, indent = '') {
	const lines = ['{']
	for (const [k, v] of Object.entries(node)) {
		const key = identRe.test(k) ? k : `'${k}'`
		if (typeof v === 'string') lines.push(`${indent}\t${key}: '${v}',`)
		else lines.push(`${indent}\t${key}: ${serializeTKeys(v, indent + '\t')},`)
	}
	lines.push(`${indent}}`)
	return lines.join('\n')
}

function shapeType(node, indent = '\t') {
	const lines = ['{']
	for (const [k, v] of Object.entries(node)) {
		const key = identRe.test(k) ? k : `'${k}'`
		if (typeof v === 'string') {
			const kind = leafType(v)
			if (kind === 'plain') lines.push(`${indent}\t${key}: string`)
			else if (kind === 'args')
				lines.push(`${indent}\t${key}: (values: TranslationValues) => string`)
			else lines.push(`${indent}\t${key}: (values: RichValues) => ReactNode`)
		} else {
			lines.push(`${indent}\t${key}: ${shapeType(v, indent + '\t')}`)
		}
	}
	lines.push(`${indent}}`)
	return lines.join('\n')
}

export function generate(messages) {
	const namespaces = collectNamespaces(messages)
	return `/* AUTO-GENERATED by scripts/generate-t-keys.mjs — DO NOT EDIT.
 * Source of truth: src/i18n/messages/uk.json
 * Regenerate: npm run generate-t-keys
 */
import type { ReactNode } from 'react'

export type TranslationValues = Record<string, string | number | Date>
export type RichValues = Record<
	string,
	string | number | Date | ((chunks: ReactNode) => ReactNode)
>

export const TKeys = ${serializeTKeys(buildTKeys(messages))} as const

export interface MessageShapes {
${namespaces.map(([p, node]) => `\t'${p}': ${shapeType(node, '\t')}`).join('\n')}
}

export type Namespace = keyof MessageShapes
`
}

const isMain =
	process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)

if (isMain) {
	const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..')
	const messages = JSON.parse(
		fs.readFileSync(path.join(root, 'src/i18n/messages/uk.json'), 'utf8'),
	)
	const outPath = path.join(root, 'src/i18n/t-keys.ts')
	fs.writeFileSync(outPath, generate(messages))
	console.log(`Wrote ${path.relative(process.cwd(), outPath)}`)
}
```

- [ ] **Step 4: Run tests to verify they pass**

```bash
node --test scripts/
```

Expected: all tests PASS.

- [ ] **Step 5: Add npm scripts and generate for real**

In `package.json` `"scripts"` add:

```json
"generate-t-keys": "node scripts/generate-t-keys.mjs",
"test:scripts": "node --test scripts/"
```

Run:

```bash
npm run generate-t-keys
```

Expected: `Wrote src/i18n/t-keys.ts`; the file contains `common: 'common'` and `'common': { loading: string }`.

- [ ] **Step 6: Exclude the generated file from lint**

In `eslint.config.mjs`, add to the exported config array (create the entry if absent):

```js
{ ignores: ['src/i18n/t-keys.ts'] },
```

- [ ] **Step 7: Verify types compile, then commit**

```bash
npx tsc --noEmit
git add scripts package.json eslint.config.mjs src/i18n/t-keys.ts
git commit -m "feat(i18n): t-keys generator with typed plain/args/rich leaves"
```

---

### Task 3: validate-i18n script (TDD)

**Files:**
- Create: `scripts/validate-i18n.mjs`
- Create: `scripts/i18n-cyrillic-allowlist.txt`
- Test: `scripts/__tests__/validate-i18n.test.mjs`
- Modify: `package.json` (scripts)

**Interfaces:**
- Consumes: `generate(messages)` from `scripts/generate-t-keys.mjs` (Task 2).
- Produces: exported pure functions `flattenKeys(node) -> string[]` (sorted dot paths), `diffKeys(ukKeys, enKeys) -> { missing, extra }`, `stripComments(src) -> string`, `CYRILLIC` regex. CLI: exit 0 = green; exit 1 with a per-problem report. `--cyrillic` flag adds the source scan.

Checks, in order:
1. **Parity**: every key in `uk.json` exists in `en.json` and vice versa (report `missing in en:` / `extra in en:` lists).
2. **Staleness**: `generate(uk.json)` must equal the current `src/i18n/t-keys.ts` byte-for-byte, else "t-keys.ts is stale — run npm run generate-t-keys".
3. **Cyrillic scan** (only with `--cyrillic`): walk `src/**/*.{ts,tsx}` skipping `src/i18n/messages/`; strip comments; any line matching `/[Ѐ-ӿ]/` not covered by an allowlist path prefix is reported as `file:line: text`.

- [ ] **Step 1: Write the failing tests** — `scripts/__tests__/validate-i18n.test.mjs`:

```js
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
```

- [ ] **Step 2: Run tests to verify they fail**

```bash
node --test scripts/
```

Expected: FAIL — `Cannot find module '../validate-i18n.mjs'`.

- [ ] **Step 3: Implement `scripts/validate-i18n.mjs`**

```js
#!/usr/bin/env node
/**
 * Validates i18n integrity. Base run: locale parity + t-keys freshness.
 * `--cyrillic`: also fails on Cyrillic characters in src/**/*.{ts,tsx}
 * outside src/i18n/messages/ (comments stripped), unless the path starts
 * with a prefix listed in scripts/i18n-cyrillic-allowlist.txt.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { generate } from './generate-t-keys.mjs'

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
	const { missing, extra } = diffKeys(
		flattenKeys(read('src/i18n/messages/uk.json')),
		flattenKeys(read('src/i18n/messages/en.json')),
	)
	for (const k of missing) problems.push(`missing in en.json: ${k}`)
	for (const k of extra) problems.push(`extra in en.json: ${k}`)

	// 2. Staleness
	const fresh = generate(read('src/i18n/messages/uk.json'))
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
```

- [ ] **Step 4: Create `scripts/i18n-cyrillic-allowlist.txt`**

```
# Files allowed to contain Cyrillic outside src/i18n/messages/.
# One path prefix per line, relative to the repo root. Keep this list empty
# unless there is a documented reason a source file must keep Cyrillic.
```

- [ ] **Step 5: Run tests to verify they pass**

```bash
node --test scripts/
```

Expected: all tests PASS.

- [ ] **Step 6: Add npm scripts and run the base validation**

In `package.json` `"scripts"` add:

```json
"validate-i18n": "node scripts/validate-i18n.mjs",
"validate-i18n:full": "node scripts/validate-i18n.mjs --cyrillic"
```

```bash
npm run validate-i18n
```

Expected: `validate-i18n: OK`. (`validate-i18n:full` will fail until Task 21 — expected.)

- [ ] **Step 7: Commit**

```bash
git add scripts package.json
git commit -m "feat(i18n): validate-i18n script (parity, staleness, cyrillic gate)"
```

---

### Task 4: Typed translation wrapper (house pattern)

**Files:**
- Create: `src/lib/contexts/translations/wrap.ts`
- Create: `src/lib/contexts/translations/translations-context.tsx`
- Create: `src/lib/contexts/translations/translations-server.ts`

**Interfaces:**
- Consumes: `MessageShapes`, `Namespace` from `@/i18n/t-keys` (Task 2).
- Produces:
  - `useCustomTranslations<N extends Namespace>(namespace: N): { t: MessageShapes[N] }` — client hook.
  - `getCustomTranslations<N extends Namespace>(namespace: N, locale?: string): Promise<{ t: MessageShapes[N] }>` — server twin; pass `locale` explicitly inside `generateMetadata` (request context isn't set up there).
  - `wrapTranslator(t: TranslatorLike, prefix?: string): unknown` — shared proxy.

Runtime classification must match the generator exactly: object → nested proxy; rich-tag string → `(values) => t.rich(key, values)`; ICU-args string → `(values) => t(key, values)`; else `t(key)`.

- [ ] **Step 1: Create `src/lib/contexts/translations/wrap.ts`**

```ts
import type { ReactNode } from 'react'

// Must stay in sync with scripts/generate-t-keys.mjs (build-time classification).
const ICU_ARGS = /\{\s*[0-9a-zA-Z_]+/
const RICH_TAG = /<[a-zA-Z][^>]*>/

/**
 * Minimal structural view over next-intl's translator, shared by the client
 * (`useTranslations`) and server (`getTranslations`) variants so one proxy
 * implementation serves both. Callers cast their translator to this.
 */
export type TranslatorLike = {
	(key: string, values?: Record<string, unknown>): string
	rich(key: string, values?: Record<string, unknown>): ReactNode
	raw(key: string): unknown
}

export function wrapTranslator(t: TranslatorLike, prefix = ''): unknown {
	return new Proxy(
		{},
		{
			get(_target, prop) {
				if (typeof prop !== 'string') return undefined
				const key = prefix ? `${prefix}.${prop}` : prop
				// validate-i18n guarantees the key exists in every locale.
				const raw = t.raw(key)
				if (raw !== null && typeof raw === 'object') return wrapTranslator(t, key)
				if (typeof raw === 'string' && RICH_TAG.test(raw)) {
					return (values: Record<string, unknown>) => t.rich(key, values)
				}
				if (typeof raw === 'string' && ICU_ARGS.test(raw)) {
					return (values: Record<string, unknown>) => t(key, values)
				}
				return t(key)
			},
		},
	)
}
```

- [ ] **Step 2: Create `src/lib/contexts/translations/translations-context.tsx`**

```tsx
'use client'

import { useTranslations } from 'next-intl'
import type { MessageShapes, Namespace } from '@/i18n/t-keys'
import { wrapTranslator, type TranslatorLike } from './wrap'

export function useCustomTranslations<N extends Namespace>(
	namespace: N,
): { t: MessageShapes[N] } {
	const t = useTranslations(namespace)
	return { t: wrapTranslator(t as unknown as TranslatorLike) as MessageShapes[N] }
}
```

- [ ] **Step 3: Create `src/lib/contexts/translations/translations-server.ts`**

```ts
import { getTranslations } from 'next-intl/server'
import type { MessageShapes, Namespace } from '@/i18n/t-keys'
import { wrapTranslator, type TranslatorLike } from './wrap'

export async function getCustomTranslations<N extends Namespace>(
	namespace: N,
	locale?: string,
): Promise<{ t: MessageShapes[N] }> {
	const t = locale
		? await getTranslations({ locale, namespace })
		: await getTranslations(namespace)
	return { t: wrapTranslator(t as unknown as TranslatorLike) as MessageShapes[N] }
}
```

- [ ] **Step 4: Verify it compiles**

```bash
npx tsc --noEmit
```

Expected: PASS. (No React test runner in the repo — runtime behavior of the proxy is exercised by the exemplar migration in Task 10 and by the generator tests that pin the same classification regexes.)

- [ ] **Step 5: Commit**

```bash
git add src/lib/contexts/translations
git commit -m "feat(i18n): typed useCustomTranslations/getCustomTranslations wrapper"
```

---

### Task 5: Move routes under `[locale]`, add middleware and locale layout

**Files:**
- Move: everything under `src/app/` **except** `api/`, `screener-proxy/`, `globals.css`, `favicon.ico`, `favicon.png` → `src/app/[locale]/`
- Modify: `src/app/[locale]/layout.tsx`
- Create: `src/middleware.ts`

**Interfaces:**
- Consumes: `routing` (Task 1).
- Produces: the `[locale]` segment every later task edits files under; `<html lang={locale}>`; `NextIntlClientProvider` available to all client components; static rendering preserved via `generateStaticParams` + `setRequestLocale`.

This task is atomic — middleware without the `[locale]` segment (or vice versa) breaks every route. Old URLs (`/About`) keep working because `as-needed` serves the default locale unprefixed.

- [ ] **Step 1: Move the routes**

```bash
mkdir -p 'src/app/[locale]'
git mv src/app/404page src/app/AI-Agent src/app/About src/app/Blog \
	src/app/MetaPixel src/app/Trading-Chat src/app/contacts src/app/dashboard \
	src/app/forgotPassword src/app/login src/app/myCabinet src/app/payment-result \
	src/app/payments src/app/paywall src/app/privacy src/app/reset-password \
	src/app/webinars src/app/components src/app/not-found.tsx src/app/page.tsx \
	src/app/layout.tsx 'src/app/[locale]/'
```

`globals.css` stays at `src/app/globals.css` (imported via the `@/app/globals.css` alias — path unchanged). `favicon.ico`/`favicon.png` stay at `src/app/` (file-convention icons). Relative imports inside the moved tree (`./components/...`) remain valid because `components/` moved along.

- [ ] **Step 2: Rewrite `src/app/[locale]/layout.tsx`**

Keep the existing `metadata` export, fb-pixel `<Script>`/`<noscript>` block, `<head>` meta tag, body classes, and provider children exactly as they are today; change only the pieces shown:

```tsx
import type { Metadata } from 'next'
import { Montserrat } from 'next/font/google'
import '@/app/globals.css'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale } from 'next-intl/server'
import { routing } from '@/i18n/routing'
// … existing component imports unchanged …

const montserrat = Montserrat({
	subsets: ['latin', 'cyrillic'], // was ['latin'] — Ukrainian UI rendered in a fallback font
	weight: ['400', '700'],
	variable: '--font-montserrat',
})

// … existing `export const metadata` unchanged (Task 8 converts it) …

export function generateStaticParams() {
	return routing.locales.map((locale) => ({ locale }))
}

export default async function RootLayout({
	children,
	params,
}: Readonly<{
	children: React.ReactNode
	params: Promise<{ locale: string }>
}>) {
	const { locale } = await params
	if (!hasLocale(routing.locales, locale)) notFound()
	setRequestLocale(locale)

	return (
		<html lang={locale} className={montserrat.variable}>
			{/* … existing <head> content unchanged … */}
			<body className={`bg-[#171723] antialiased min-h-screen flex flex-col`}>
				<QueryProvider>
					<NextIntlClientProvider>
						{/* … existing children: InnerWhiteHeader, LoginModal, Drawer,
						     MainDrawer, <main>, Footer — unchanged … */}
					</NextIntlClientProvider>
				</QueryProvider>
			</body>
		</html>
	)
}
```

(`NextIntlClientProvider` with no props inherits locale and messages in next-intl v4.)

- [ ] **Step 3: Create `src/middleware.ts`**

```ts
import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

export default createMiddleware(routing)

export const config = {
	// Skip API routes, the two proxies, Next internals, and files with extensions.
	matcher: ['/((?!api|screener-proxy|tron-proxy|_next|_vercel|.*\\..*).*)'],
}
```

- [ ] **Step 4: Add `setRequestLocale` to server pages that should stay static**

In each **server** page/layout under `[locale]` (no `'use client'`): `About/page.tsx`, `privacy/page.tsx` at minimum — add as the first statement of the component:

```tsx
export default async function About({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params
	setRequestLocale(locale)
	// … existing JSX unchanged …
}
```

with `import { setRequestLocale } from 'next-intl/server'`.

- [ ] **Step 5: Build and compare route staticness**

```bash
yarn build
```

Expected: PASS. In the route table, `/[locale]/About` and `/[locale]/privacy` show as static (`●` SSG), not `ƒ`. Routes that were already dynamic (Blog fetch, cabinet layouts with `redirect()`) stay dynamic.

- [ ] **Step 6: Smoke old URLs**

```bash
yarn dev
```

Verify manually: `/` renders home; `/About` renders (unprefixed, Ukrainian); `/en/About` renders (same content for now — text migrates later); `/de/About` → 404; `/api/*` untouched by middleware.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat(i18n): move routes under [locale], add middleware and locale layout"
```

---

### Task 6: Localized 404 (catch-all) and 404page reconciliation

**Files:**
- Create: `src/app/[locale]/[...rest]/page.tsx`
- Modify: `src/app/[locale]/not-found.tsx`
- Delete (after check): `src/app/[locale]/404page/`
- Modify: `src/i18n/messages/uk.json`, `src/i18n/messages/en.json` (namespace `notFound`)

**Interfaces:**
- Consumes: `useCustomTranslations`/`getCustomTranslations` (Task 4), `TKeys.notFound` (generated).

- [ ] **Step 1: Create the catch-all** — `src/app/[locale]/[...rest]/page.tsx`:

```tsx
import { notFound } from 'next/navigation'

// Funnels every unmatched path into the localized [locale]/not-found.tsx.
export default function CatchAllNotFound() {
	notFound()
}
```

- [ ] **Step 2: Reconcile the two 404 implementations**

```bash
grep -rn '404page' src
```

Read both `src/app/[locale]/404page/page.tsx` and `src/app/[locale]/not-found.tsx`. Keep `not-found.tsx` (Next convention) as the single implementation; if `404page` has richer content/design, port that JSX into `not-found.tsx`. Update any links found by the grep to plain `/` or remove them, then:

```bash
git rm -r 'src/app/[locale]/404page'
```

- [ ] **Step 3: Extract `not-found.tsx` strings**

List every user-visible string in the final `not-found.tsx`, add them under `notFound` in `uk.json` (verbatim) and `en.json` (drafted), e.g.:

```json
"notFound": {
	"title": "Сторінку не знайдено",
	"goHome": "На головну"
}
```

(Use the file's actual strings — the above shows the shape.) Then:

```bash
npm run generate-t-keys
```

- [ ] **Step 4: Use translations in `not-found.tsx`**

If the file is a client component, use the hook; if server, `getCustomTranslations` (request context resolves the locale — `not-found` renders inside the locale layout):

```tsx
import { getCustomTranslations } from '@/lib/contexts/translations/translations-server'
import { TKeys } from '@/i18n/t-keys'

export default async function NotFound() {
	const { t } = await getCustomTranslations(TKeys.notFound)
	return (/* existing JSX with strings replaced by t.title, t.goHome, … */)
}
```

- [ ] **Step 5: Validate, build, smoke, commit**

```bash
npm run validate-i18n && npx tsc --noEmit && yarn build
```

Smoke: `/no-such-page` shows the Ukrainian 404; `/en/no-such-page` shows the English 404.

```bash
git add -A
git commit -m "feat(i18n): localized 404 via [...rest] catch-all, retire 404page"
```

---

### Task 7: Swap to locale-aware navigation

**Files:**
- Modify: all files under `src/app/[locale]` importing `next/link` (26 files) or routing APIs from `next/navigation` (32 files)

**Interfaces:**
- Consumes: `Link`, `useRouter`, `usePathname`, `redirect` from `@/i18n/navigation` (Task 1).

Rules — this is the entire task, applied mechanically:
- `import Link from 'next/link'` → `import { Link } from '@/i18n/navigation'` (note: default → **named** import; JSX usage unchanged).
- From `next/navigation`, move **only** `useRouter`, `usePathname`, `redirect` to `@/i18n/navigation`.
- **Keep** importing from `next/navigation`: `useSearchParams`, `useParams`, `notFound`, `permanentRedirect` — these are not locale-aware and must not be swapped. Files importing both kinds end up with two import lines.
- Path strings stay unprefixed: `router.push('/login')`, `redirect('/myCabinet/screener')` — the wrappers add the locale prefix.
- Internal raw anchors become `Link`: e.g. `src/app/[locale]/About/page.tsx` breadcrumbs use `<a href='/'>` / `<a href='/About'>` → `<Link href='/'>` / `<Link href='/About'>`. Find them all with `grep -rn "href='/" 'src/app/[locale]' | grep -v Link | grep -v http`.
- `window.location.href = '/...'` assignments to internal paths (check payment flows): leave external/callback URLs alone; convert internal ones to `router.push('/...')` only when the component already has the router — otherwise leave and note it in the commit message (unprefixed = uk fallback, acceptable).

- [ ] **Step 1: Enumerate the work**

```bash
grep -rln "from 'next/link'" 'src/app/[locale]'
grep -rln "from 'next/navigation'" 'src/app/[locale]'
```

- [ ] **Step 2: Apply the swap to every listed file** (per rules above), including the three server redirects: `[locale]/payments/layout.tsx`, `[locale]/dashboard/page.tsx`, `[locale]/myCabinet/layout.tsx` (their `redirect` import moves to `@/i18n/navigation`; call sites unchanged).

- [ ] **Step 3: Verify nothing was missed and nothing over-swapped**

```bash
grep -rn "from 'next/link'" 'src/app/[locale]'            # expect: no output
grep -rn "useRouter\|usePathname" 'src/app/[locale]' | grep "next/navigation"  # expect: no output
grep -rn "useSearchParams\|useParams\|notFound" 'src/app/[locale]' | grep "@/i18n/navigation"  # expect: no output
```

- [ ] **Step 4: Type-check, build, smoke**

```bash
npx tsc --noEmit && yarn build
```

Smoke: on `/en`, header/nav links navigate within `/en/...`; on `/`, links stay unprefixed; login redirect flow works in both.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(i18n): switch to locale-aware Link/useRouter/usePathname/redirect"
```

---

### Task 8: Localized metadata, OpenGraph locale, hreflang

**Files:**
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/app/[locale]/Blog/[slug]/page.tsx` (existing `generateMetadata`)
- Modify: `src/i18n/messages/uk.json`, `en.json` (namespace `meta`)

**Interfaces:**
- Consumes: `getCustomTranslations(namespace, locale)` (Task 4 — the explicit-locale form is required in `generateMetadata`).

- [ ] **Step 1: Add the `meta` namespace**

`uk.json`:

```json
"meta": {
	"title": "PantheonX",
	"description": "Криптовалютний дашборд та освітня платформа PantheonX"
}
```

`en.json`:

```json
"meta": {
	"title": "PantheonX",
	"description": "PantheonX crypto dashboard and education platform"
}
```

Run `npm run generate-t-keys`.

- [ ] **Step 2: Convert the layout's static `metadata` to `generateMetadata`**

In `src/app/[locale]/layout.tsx`, replace `export const metadata: Metadata = {…}` with (preserving all existing fields — icons, robots, formatDetection, OG images/url/siteName — exactly as they are):

```tsx
import { getCustomTranslations } from '@/lib/contexts/translations/translations-server'
import { TKeys } from '@/i18n/t-keys'

export async function generateMetadata({
	params,
}: {
	params: Promise<{ locale: string }>
}): Promise<Metadata> {
	const { locale } = await params
	const { t } = await getCustomTranslations(TKeys.meta, locale)
	return {
		metadataBase: new URL('https://www.pantheonx.club'),
		title: t.title,
		description: t.description,
		applicationName: 'PantheonX',
		category: 'cryptology',
		alternates: {
			languages: { uk: '/', en: '/en' },
		},
		// … icons, formatDetection, robots — copied unchanged from the old object …
		openGraph: {
			title: t.title,
			description: t.description,
			url: 'https://www.pantheonx.club',
			siteName: 'PantheonX',
			images: [
				{
					url: 'https://www.pantheonx.club/Header/og-image.png',
					width: 300,
					height: 200,
				},
			],
			locale: locale === 'uk' ? 'uk_UA' : 'en_US',
			type: 'website',
		},
	}
}
```

- [ ] **Step 3: Thread locale through Blog slug metadata**

In `src/app/[locale]/Blog/[slug]/page.tsx`, the params type gains `locale`: `params: Promise<{ locale: string; slug: string }>`. Post content/title stay whatever the backend returns; only add `openGraph.locale` the same way if the existing metadata sets one.

- [ ] **Step 3b: Find any other page-level metadata**

```bash
grep -rln 'generateMetadata\|export const metadata' 'src/app/[locale]' | grep -v layout.tsx
```

Each hit with translatable title/description gets the same treatment: `generateMetadata` + `getCustomTranslations(TKeys.meta, locale)` (add page-specific keys under `meta.<page>` if the copy differs from the site default).

- [ ] **Step 4: Verify**

```bash
npm run validate-i18n && yarn build
curl -s http://localhost:3000/ | grep -o '<html lang="uk"'
curl -s http://localhost:3000/en | grep -o '<html lang="en"'
curl -s http://localhost:3000/en | grep -o 'PantheonX crypto dashboard and education platform'
```

(with `yarn dev` running). Expected: each grep finds its match; page source shows `hreflang` alternate links.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(i18n): localized metadata, og locale, hreflang alternates"
```

---

### Task 9: Language switcher

**Files:**
- Create: `src/app/[locale]/components/LayoutItems/LocaleSwitcher.tsx`
- Modify: `src/app/[locale]/components/LayoutItems/components/Header/InnerWhiteHeader.tsx`
- Modify: `src/app/[locale]/components/HeaderComps/Drawers/MainDrawer.tsx`

**Interfaces:**
- Consumes: `Link`, `usePathname` from `@/i18n/navigation`; `useLocale` from `next-intl`; `routing` (Task 1).

- [ ] **Step 1: Create the switcher**

```tsx
'use client'

import { Suspense } from 'react'
import { useLocale } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { Link, usePathname } from '@/i18n/navigation'
import { routing } from '@/i18n/routing'

function SwitcherLinks() {
	const locale = useLocale()
	const pathname = usePathname()
	const searchParams = useSearchParams()
	const query = searchParams.toString()
	const href = query ? `${pathname}?${query}` : pathname

	return (
		<div className='flex items-center gap-1.5 text-xs font-semibold uppercase'>
			{routing.locales.map((l) => (
				<Link
					key={l}
					href={href}
					locale={l}
					className={
						l === locale
							? 'text-white'
							: 'text-[#D2D2FF] opacity-60 hover:opacity-100'
					}
				>
					{l}
				</Link>
			))}
		</div>
	)
}

// useSearchParams requires a Suspense boundary when the page is statically rendered.
export default function LocaleSwitcher() {
	return (
		<Suspense fallback={null}>
			<SwitcherLinks />
		</Suspense>
	)
}
```

- [ ] **Step 2: Mount it**

Read `InnerWhiteHeader.tsx`; render `<LocaleSwitcher />` in the desktop header's right-side control group (next to the auth/profile controls). Read `MainDrawer.tsx`; render it near the top of the drawer's content list. Import in both:

```tsx
import LocaleSwitcher from '@/app/[locale]/components/LayoutItems/LocaleSwitcher'
```

(or the correct relative path per each file's existing import style).

- [ ] **Step 3: Verify behavior**

`yarn dev`, then: on `/About` click **EN** → lands on `/en/About`; click **UK** → back to `/About`; navigate around — locale persists (middleware writes `NEXT_LOCALE`); reload `/` after choosing EN → 307 to `/en` (cookie detection, per spec). Mobile drawer shows the switcher.

- [ ] **Step 4: Type-check, build, commit**

```bash
npx tsc --noEmit && yarn build
git add -A
git commit -m "feat(i18n): UK/EN locale switcher in header and mobile drawer"
```

---

### Task 10: Auth migration — the fully-worked exemplar

Every later migration task (11–19) follows this task's exact mechanics. Read this one first.

**Files:**
- Modify: `src/app/[locale]/components/Auth/**` (AuthModal, Login.tsx, Register.tsx, …), `src/app/[locale]/login/**`, `src/app/[locale]/forgotPassword/page.tsx`, `src/app/[locale]/reset-password/[uidb64]/[token]/page.tsx`
- Modify: `src/api/Auth/types.ts` (6 Zod schemas → factories) **and all their consumers** (settings/personalData pages update their schema construction in this task too, so the build stays green — their remaining hardcoded JSX text migrates in Task 15)
- Modify: `src/i18n/messages/uk.json`, `en.json` (namespaces `auth`, `validation`, `errors`)

**Interfaces:**
- Consumes: `useCustomTranslations`, `TKeys` (Tasks 2, 4).
- Produces: `validation` and `errors` namespaces + factory pattern `create<X>Schema(t: MessageShapes['validation'])` that Tasks 15 and 18 reuse; exported types become `z.infer<ReturnType<typeof createXSchema>>`.

- [ ] **Step 1: Enumerate every hardcoded string**

```bash
grep -rnE '[А-Яа-яЄєІіЇїҐґ]' 'src/app/[locale]/components/Auth' 'src/app/[locale]/login' \
	'src/app/[locale]/forgotPassword' 'src/app/[locale]/reset-password' src/api/Auth/types.ts
```

Every hit that is user-visible (labels, placeholders, buttons, headings, zod messages, error strings) gets a key. Comments are skipped.

- [ ] **Step 2: Add keys to both locale files**

`uk.json` gains (values verbatim from code; `auth` list below is illustrative shape — use the actual strings from Step 1; `validation`/`errors` lists are the actual current strings):

```json
"auth": {
	"login": {
		"title": "…",
		"emailPlaceholder": "…",
		"submit": "…",
		"consent": "Продовжуючи, ви підтверджуєте, що згодні увійти до облікового запису"
	},
	"register": { "…": "…" },
	"forgotPassword": {
		"instructions": "…інструкціями для скидання пароля. Перевірте вхідні та папку…"
	},
	"resetPassword": { "…": "…" }
},
"validation": {
	"firstNameRequired": "Ім'я обов'язкове",
	"lastNameRequired": "Прізвище обов'язкове",
	"phoneInvalid": "Невірний формат телефону",
	"solanaInvalid": "Невірний формат Solana адреси",
	"currentPasswordRequired": "Введіть поточний пароль",
	"minChars": "{count, plural, one {Мінімум # символ} few {Мінімум # символи} many {Мінімум # символів} other {Мінімум # символа}}",
	"passwordsMismatch": "Паролі не співпадають",
	"newPasswordMustDiffer": "Новий пароль має відрізнятися від поточного",
	"emailRequired": "Email обовʼязковий",
	"emailInvalid": "Невірний формат email",
	"passwordConfirmationRequired": "Введіть пароль для підтвердження"
},
"errors": {
	"invalidCredentials": "Невірні облікові дані",
	"userNotActive": "Обліковий запис не активний"
}
```

`en.json` mirrors every key with drafted English, e.g. `"minChars": "{count, plural, one {Minimum # character} other {Minimum # characters}}"`, `"invalidCredentials": "Invalid credentials"`, `"userNotActive": "Account is not active"`.

```bash
npm run generate-t-keys && npm run validate-i18n
```

- [ ] **Step 3: Convert `src/api/Auth/types.ts` schemas to factories**

Pattern (shown for ChangePassword — apply identically to Profile, ForgotPassword, SetNewPassword, ChangeLogin, DeleteAccount):

```ts
import type { MessageShapes } from '@/i18n/t-keys'

type ValidationT = MessageShapes['validation']

export const createChangePasswordSchema = (t: ValidationT) =>
	z
		.object({
			old_password: z.string().min(1, t.currentPasswordRequired),
			new_password: z.string().min(6, t.minChars({ count: 6 })),
			new_password_confirm: z.string().min(6, t.minChars({ count: 6 })),
		})
		.refine((data) => data.new_password === data.new_password_confirm, {
			message: t.passwordsMismatch,
			path: ['new_password_confirm'],
		})
		.refine((data) => data.new_password !== data.old_password, {
			message: t.newPasswordMustDiffer,
			path: ['new_password'],
		})

export type ChangePasswordData = z.infer<ReturnType<typeof createChangePasswordSchema>>
```

(`ProfileUpdateSchema` has no messages — leave it as-is.)

- [ ] **Step 4: Update every factory consumer**

```bash
grep -rln 'ProfileSchema\|ChangePasswordSchema\|ForgotPasswordSchema\|SetNewPasswordSchema\|ChangeLoginSchema\|DeleteAccountSchema' src
```

In each consumer component:

```tsx
import { useMemo } from 'react'
import { useCustomTranslations } from '@/lib/contexts/translations/translations-context'
import { TKeys } from '@/i18n/t-keys'
import { createChangePasswordSchema } from '@/api/Auth/types'

const { t: tValidation } = useCustomTranslations(TKeys.validation)
const schema = useMemo(() => createChangePasswordSchema(tValidation), [tValidation])
// resolver: zodResolver(schema)
```

- [ ] **Step 5: Migrate the Login error mapping** — `src/app/[locale]/components/Auth/components/Login.tsx`, current code at lines 35–60 becomes:

```tsx
const { t: tErrors } = useCustomTranslations(TKeys.errors)

// inside useMutation onError:
onError: (error: any) => {
	console.error('Login error details:', error)

	let errorMessage = tErrors.invalidCredentials

	if (error?.response?.data) {
		const responseData = error.response.data
		if (responseData.error) {
			errorMessage = responseData.error
		} else if (responseData.message) {
			errorMessage = responseData.message
		} else if (responseData.detail) {
			errorMessage = responseData.detail
		}
	}

	if (errorMessage.includes('Invalid credentials')) {
		errorMessage = tErrors.invalidCredentials
	} else if (errorMessage.includes('User is not active')) {
		errorMessage = tErrors.userNotActive
	}

	setErrorMessage(errorMessage)
},
```

- [ ] **Step 6: Replace all remaining JSX strings** in the Step-1 file list with `t.…` via `useCustomTranslations(TKeys.auth.login)` etc. Inline template literals like `` `Мінімум ${minLen[1]} символів` `` (in `reset-password/[uidb64]/[token]/page.tsx:30`) become `tValidation.minChars({ count: Number(minLen[1]) })`.

- [ ] **Step 7: Validate, build, smoke, commit**

```bash
npm run validate-i18n && npx tsc --noEmit && yarn build
```

Smoke (`yarn dev`): login form in uk and at `/en` in English; submit bad credentials → localized error; forgot-password email validation shows localized messages; password-change form (settings) still validates.

```bash
git add -A
git commit -m "feat(i18n): migrate auth flows, zod validation factories, error mapping"
```

---

### Tasks 11–19: Feature migrations

Each task below repeats Task 10's mechanics exactly: **(a)** enumerate with the task's grep; **(b)** add keys verbatim-uk + drafted-en under the task's namespace(s); **(c)** `npm run generate-t-keys`; **(d)** replace strings — client components via `useCustomTranslations(TKeys.<ns>)`, server components via `await getCustomTranslations(TKeys.<ns>)`; interpolated literals → parameterized keys; counts → ICU plural; markup-in-text → rich keys; **(e)** `npm run validate-i18n && npx tsc --noEmit && yarn build`; **(f)** commit `feat(i18n): migrate <area>`. Per-task file sets, namespaces, and area-specific notes:

### Task 11: Shared layout, nav, common UI

- [ ] Migrate. Grep scope: `'src/app/[locale]/components/LayoutItems' 'src/app/[locale]/components/HeaderComps' 'src/app/[locale]/components/UI' 'src/app/[locale]/components/Buttons' 'src/app/[locale]/components/Shop' 'src/app/[locale]/components/LatestWebinar.tsx' 'src/app/[locale]/components/Blog'`. Namespaces: `nav` (header/drawer/footer links), `common` (buttons, generic labels), `blog` (Blog card components). Note: `LatestWebinar.tsx` date/time formatting is handled in Task 20 — migrate only its text here. No translated props: if a nav item component receives label text from a parent map, move the map into the child or key it (`nav.items.about` etc.) so each component resolves its own strings.

### Task 12: Home page

- [ ] Migrate. Grep scope: `'src/app/[locale]/page.tsx' 'src/app/[locale]/components/HomePage'` (20 files — the largest single component group; commit in 2–3 slices if needed, each slice validating green). Namespace: `home`. `page.tsx` is a client component — hook, not server twin.

### Task 13: Public pages — About, privacy, contacts, webinars

- [ ] Migrate. Grep scope: `'src/app/[locale]/About' 'src/app/[locale]/privacy' 'src/app/[locale]/contacts' 'src/app/[locale]/webinars' 'src/app/[locale]/Blog'`. Namespaces: `about`, `privacy`, `contacts`, `webinars`, `blog`. About and privacy are server components → `getCustomTranslations`; keep their `setRequestLocale` calls (Task 5) **above** the translation call. Privacy is long-form legal text: split into one key per paragraph/heading (`privacy.section1Title`, `privacy.section1Body`, …); paragraphs containing links/bold become rich keys. Blog post content itself stays backend-driven (out of scope) — only chrome (breadcrumbs, headings, comment-form labels) migrates.

### Task 14: Payments funnel — paywall, payments, payment-result

- [ ] Migrate. Grep scope: `'src/app/[locale]/paywall' 'src/app/[locale]/payments' 'src/app/[locale]/payment-result'`. Namespaces: `paywall`, `payments`. Real parameterized cases from the code — `YearSubscriptions.tsx:46` `` alert(`Помилка: ${errorDetail}`) `` and `:54` `` alert(`Помилка платіжного шлюзу: ${detail}`) `` (same in `MonthSubscription.tsx`) become:

```json
"paywall": {
	"paymentError": "Помилка: {detail}",
	"gatewayError": "Помилка платіжного шлюзу: {detail}"
}
```

```tsx
alert(t.paymentError({ detail: errorDetail }))
```

Do not touch external callback URLs or payment-provider redirect targets.

### Task 15: Cabinet core — personalData, subscriptions, certificates, settings, webinars

- [ ] Migrate. Grep scope: `'src/app/[locale]/myCabinet'` minus `screener`, `tradingBots`, `studyPlatform` subdirs (they're Tasks 17/18/16). Namespaces: `cabinet.personalData`, `cabinet.subscriptions`, `cabinet.certificates`, `cabinet.settings`, `cabinet.webinars`, plus cabinet-level nav/layout strings under `cabinet.common` (nested namespace — the generator handles it). Settings page note: `settings/page.tsx:68` `` `Мінімум ${minLen[1]} символів` `` → `tValidation.minChars({ count: Number(minLen[1]) })` (key exists since Task 10). Certificates/subscriptions date rendering is Task 20 — text only here. Zod consumers here already construct schemas via factories (Task 10 Step 4) — only their JSX strings remain.

### Task 16: Study platform

- [ ] Migrate. Grep scope: `'src/app/[locale]/myCabinet/studyPlatform'`. Namespace: `cabinet.studyPlatform`. Includes the quiz page's `enqueueSnackbar(...)` toasts (`quiz/[quizId]/page.tsx`) — notistack calls sit inside a client component, so the hook's `t` works directly: `enqueueSnackbar(t.quizPassed, { variant: 'success' })`. Lesson/course content from the backend stays untranslated (out of scope) — only UI chrome.

### Task 17: Screener

- [ ] Migrate. Grep scope: `'src/app/[locale]/components/Screener' 'src/app/[locale]/myCabinet/screener'`. Namespace: `screener` (use nested sub-objects for dense areas: `screener.filters.*`, `screener.table.*`, `screener.tooltips.*`). `src/lib/screener/format.ts` stays `en-US` (deliberate — Global Constraints). Table column headers and tooltip text all count as user-facing.

### Task 18: Trading bots

- [ ] Migrate. Grep scope: `'src/app/[locale]/myCabinet/tradingBots' src/hooks/TradingBots`. Namespaces: `tradingBots`, `errors`. Component-local Zod schemas in tradingBots forms follow the Task 10 factory pattern with keys under `validation` (schema defined inside the component may simply build inline with `tValidation.*` — factories are only required for module-level schemas). The hook errors — `src/hooks/TradingBots/useAlgonixSession.ts:76` `new Error("Email користувача не знайдено")` and `:82` `new Error("Сесія платформи не знайдена. Будь ласка, увійдіть знову.")` — must not translate inside the hook (it's not a component boundary problem, it's that hooks shared across trees shouldn't own copy). Instead the hook throws error **codes**:

```ts
// useAlgonixSession.ts — errors carry stable codes, components translate them
setError(new Error('userEmailNotFound'))
setError(new Error('platformSessionNotFound'))
```

```json
"errors": {
	"userEmailNotFound": "Email користувача не знайдено",
	"platformSessionNotFound": "Сесія платформи не знайдена. Будь ласка, увійдіть знову."
}
```

Rendering components map `error.message` through `tErrors` with a plain-string fallback **only** for unknown codes coming from the backend (that is API data, not a translation fallback):

```tsx
const { t: tErrors } = useCustomTranslations(TKeys.errors)
const known: Record<string, string> = {
	userEmailNotFound: tErrors.userEmailNotFound,
	platformSessionNotFound: tErrors.platformSessionNotFound,
}
const display = known[error.message] ?? error.message
```

`useUserInfo.ts` / `useCheckPersonalData.ts` Cyrillic is in comments — no change.

### Task 19: AI Agent and Trading Chat

- [ ] Migrate. Grep scope: `'src/app/[locale]/AI-Agent' 'src/app/[locale]/Trading-Chat'`. Namespaces: `aiAgent`, `tradingChat`. Real cases: the greeting `'Привіт! Як я можу допомогти вам сьогодні у світі криптовалют та фінансової грамотності?'` appears three times in `AI-Agent/page.tsx` (lines 92, 110, 193) — one key `aiAgent.greeting`, three usages. `AI-Agent/page.tsx:165` `` `Виникла помилка ${error?.response?.status}, спробуйте будь ласка ще раз` `` →

```json
"aiAgent": { "requestError": "Виникла помилка {status}, спробуйте будь ласка ще раз" }
```

```tsx
text: t.requestError({ status: error?.response?.status ?? '' }),
```

---

### Task 20: Locale-aware date/time formatting

**Files:**
- Modify: `src/app/[locale]/Blog/page.tsx:34`, `src/app/[locale]/Blog/[slug]/components/BlogComments.tsx:59`, `src/app/[locale]/components/LatestWebinar.tsx:36,45`, `src/app/[locale]/myCabinet/webinars/components/WebinarCard.tsx:23,32`, `src/app/[locale]/myCabinet/certificates/components/MyCertificates.tsx:106`, `src/app/[locale]/myCabinet/subscriptions/page.tsx:173,182`

**Interfaces:**
- Consumes: `useFormatter` from `next-intl` (client), `getFormatter` from `next-intl/server` (server).

**NOT touched (deliberate, per spec):** `src/app/[locale]/myCabinet/tradingBots/components/balance/BalanceCard.tsx:10` and `src/lib/screener/format.ts:16` — `en-US` number formatting for prices/balances stays.

- [ ] **Step 1: Convert each site.** Client components:

```tsx
import { useFormatter } from 'next-intl'

const format = useFormatter()
// was: new Date(post.created_at).toLocaleDateString('uk-UA')
format.dateTime(new Date(post.created_at), { day: 'numeric', month: 'long', year: 'numeric' })
```

Server components:

```tsx
import { getFormatter } from 'next-intl/server'

const format = await getFormatter()
format.dateTime(new Date(post.created_at), { day: 'numeric', month: 'long', year: 'numeric' })
```

Where the old call passed explicit options (`LatestWebinar.tsx`, `WebinarCard.tsx` — date and time helpers), carry those exact option objects over into `format.dateTime(date, options)`; only the hardcoded `'uk-UA'` locale argument disappears. Bare `toLocaleDateString('uk-UA')` (no options) maps to `{ day: 'numeric', month: 'numeric', year: 'numeric' }` to preserve the current uk rendering.

- [ ] **Step 2: Verify no site was missed**

```bash
grep -rn "toLocaleDateString('uk-UA')\|toLocaleTimeString('uk-UA')\|toLocaleString('uk-UA')" src
```

Expected: no output.

- [ ] **Step 3: Type-check, build, smoke, commit**

```bash
npx tsc --noEmit && yarn build
```

Smoke: Blog dates show Ukrainian month names on `/Blog`, English on `/en/Blog`.

```bash
git add -A
git commit -m "feat(i18n): locale-aware date/time formatting via useFormatter"
```

---

### Task 21: Flip the permanent Cyrillic gate + full DoD sweep

**Files:**
- Modify: `scripts/i18n-cyrillic-allowlist.txt` (only if a documented exclusion is genuinely needed)

- [ ] **Step 1: Run the full gate**

```bash
npm run validate-i18n:full
```

Every reported `file:line` is either a missed migration (go fix it — extend the relevant task's namespace) or a documented exclusion (add the path prefix to the allowlist **with a `#` comment explaining why**). Target: green with an empty-or-tiny allowlist.

- [ ] **Step 2: Full verification battery**

```bash
node --test scripts/          # generator + validator tests
npm run validate-i18n:full    # parity + staleness + cyrillic
npx tsc --noEmit
yarn build                    # About/privacy/home static (●) for both locales
```

Expected: all green.

- [ ] **Step 3: Manual smoke (DoD §4–6 of the spec)** — with `yarn dev`:

- home → login → myCabinet (subscriptions, screener, tradingBots) → About → Blog, in **both** locales
- switcher toggles locale and keeps the path + query string
- `/About` → Ukrainian, no prefix; `/en/About` → English; `/de/About` → 404
- `NEXT_LOCALE` cookie persists the choice across navigation and reload
- `/api/*`, `/screener-proxy/*`, `/tron-proxy/*` unaffected
- Blog/webinars/subscriptions dates: localized month names per locale
- password min-length message (parameterized) and a plural message render correctly in both locales
- payment-result flow with an `en` cookie: unprefixed callback URL 307s to `/en/payment-result` **with query string intact**
- unknown path (`/xyz`) shows translated 404 in both locales

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "feat(i18n): enable permanent cyrillic gate, complete uk/en migration"
```

---

## English copy review (post-implementation, human)

`en.json` was drafted during extraction. The team reviews it as a single-file sweep (spec: "Review happens in en.json as a single-file sweep"). Any wording change is a values-only edit — keys, `t-keys.ts`, and components don't change; `npm run validate-i18n` still guards parity.
