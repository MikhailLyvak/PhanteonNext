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
