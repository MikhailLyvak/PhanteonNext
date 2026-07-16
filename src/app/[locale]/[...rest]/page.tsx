import { notFound } from 'next/navigation'

// Funnels every unmatched path into the localized [locale]/not-found.tsx.
export default function CatchAllNotFound() {
	notFound()
}
