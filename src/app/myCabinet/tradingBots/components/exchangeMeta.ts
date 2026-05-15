export type ExchangeMeta = {
  label: string
  icon: string
  accent: string
}

export const EXCHANGE_META: Record<string, ExchangeMeta> = {
  BYBIT: {
    label: 'Bybit',
    icon: '/Exchange/bybit.png',
    accent: '#F7A600',
  },
  BINANCE: {
    label: 'Binance',
    icon: '/Exchange/binance.png',
    accent: '#F0B90B',
  },
  BINGX: {
    label: 'BingX',
    icon: '/Exchange/bingx.png',
    accent: '#2354E6',
  },
}

export const getExchangeMeta = (exchange?: string | null): ExchangeMeta | null => {
  if (!exchange) return null
  return EXCHANGE_META[exchange.toUpperCase()] ?? null
}
