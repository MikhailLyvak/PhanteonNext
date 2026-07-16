import createMiddleware from 'next-intl/middleware'
import { routing } from '@/i18n/routing'

export default createMiddleware(routing)

export const config = {
	// Skip API routes, the two proxies, Next internals, and files with extensions.
	matcher: ['/((?!api|screener-proxy|tron-proxy|_next|_vercel|.*\\..*).*)'],
}
