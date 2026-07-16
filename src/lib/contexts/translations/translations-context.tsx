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
