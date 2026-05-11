export type ExchangeMeta = {
  label: string
  icon: string
  accent: string
  glow: string
}

export const EXCHANGE_META: Record<string, ExchangeMeta> = {
  BYBIT: {
    label: 'Bybit',
    icon: '/Exchange/bybit.png',
    accent: '#F7A600',
    glow: 'rgba(247, 166, 0, 0.35)',
  },
  BINANCE: {
    label: 'Binance',
    icon: '/Exchange/binance.png',
    accent: '#F0B90B',
    glow: 'rgba(240, 185, 11, 0.35)',
  },
  BINGX: {
    label: 'BingX',
    icon: '/Exchange/bingx.png',
    accent: '#2354E6',
    glow: 'rgba(35, 84, 230, 0.45)',
  },
}

export const getExchangeMeta = (exchange?: string | null): ExchangeMeta | null => {
  if (!exchange) return null
  return EXCHANGE_META[exchange.toUpperCase()] ?? null
}
