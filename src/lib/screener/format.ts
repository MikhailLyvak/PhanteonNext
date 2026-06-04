export function formatUsdShort(value: number): string {
	const abs = Math.abs(value)
	if (abs >= 1e9) return `$${(value / 1e9).toFixed(2)}B`
	if (abs >= 1e6) return `$${(value / 1e6).toFixed(2)}M`
	if (abs >= 1e3) return `$${(value / 1e3).toFixed(2)}K`
	return `$${value.toFixed(2)}`
}

export function formatPercent(value: number, digits = 2): string {
	const sign = value > 0 ? '+' : ''
	return `${sign}${value.toFixed(digits)}%`
}

export function formatPrice(price: number, precision: number): string {
	if (!Number.isFinite(price)) return '—'
	return price.toLocaleString('en-US', {
		minimumFractionDigits: precision,
		maximumFractionDigits: precision,
	})
}
