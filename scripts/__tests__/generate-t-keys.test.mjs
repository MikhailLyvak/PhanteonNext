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
