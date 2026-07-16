import React from 'react'

interface Props {
  price: string;
  symbol: string;
}

const CryptoBadge = ({ price, symbol }: Props) => {
  return (
    <span className="bg-[#242433] text-[#D2D2FFAB] text-sm font-semibold me-2 px-4 py-2 rounded-2xl inline-flex items-center gap-2 lg:gap-6">
      <div className="flex">{symbol}</div>
      <div className="flex">
        {new Intl.NumberFormat('fr-FR', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
          useGrouping: true,
          style: 'decimal'
        }).format(parseFloat(price))} $
      </div>
    </span>
  )
}

export default CryptoBadge
