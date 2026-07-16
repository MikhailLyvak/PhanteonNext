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
