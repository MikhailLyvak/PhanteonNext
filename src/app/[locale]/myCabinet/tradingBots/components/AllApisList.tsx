'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { Trash2 } from 'lucide-react'
import { Triangle } from 'react-loader-spinner'
import useUserApis from '@/hooks/TradingBots/useUserApis'
import useDeleteApi from '@/hooks/TradingBots/useDeleteApi'
import { getExchangeMeta } from './exchangeMeta'

const truncate = (s: string, max = 12) =>
  s.length <= max ? s : `${s.slice(0, max)}…`

export default function AllApisList() {
  const router = useRouter()
  const { data: apis, isLoading } = useUserApis()
  const deleteApi = useDeleteApi()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const goToRobot = (apiId: string) => {
    router.replace(`/myCabinet/tradingBots?step=robot&apiId=${apiId}`)
  }

  const handleDelete = (e: React.MouseEvent, apiId: string) => {
    e.stopPropagation()
    setDeletingId(apiId)
  }

  const confirmDelete = (apiId: string) => {
    deleteApi.mutate(apiId, { onSettled: () => setDeletingId(null) })
  }

  const list = apis ?? []

  return (
    <div className="w-full">
      <div className="mt-4 p-6 bg-[#242433] rounded-2xl">
        <div className="flex items-end justify-between gap-3">
          <h6 className="text-[#D2D2FF] text-xl font-semibold">Збережені API</h6>
          {!isLoading && list.length > 0 && (
            <span className="text-[10px] uppercase tracking-[0.18em] text-[#8c8ca0]">
              {list.length} {list.length === 1 ? 'ключ' : 'ключів'}
            </span>
          )}
        </div>

        {isLoading && (
          <div className="mt-4">
            <Triangle
              visible={true}
              height={16}
              width={16}
              color="#fff"
              ariaLabel="triangle-loading"
            />
          </div>
        )}

        {!isLoading && list.length === 0 && (
          <p className="text-gray-400 text-sm mt-4">
            У вас ще немає збережених API.
          </p>
        )}

        {!isLoading && list.length > 0 && (
          <ul className="mt-4 flex flex-col gap-3">
            {list.map((api) => {
              const label = api.title?.trim() ? api.title : truncate(api.key)
              const meta = getExchangeMeta(api.exchange)
              return (
                <li key={api.id}>
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => goToRobot(api.id)}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') goToRobot(api.id) }}
                    className="group relative w-full p-4 rounded-xl bg-[#1D1D2A] text-left ring-1 ring-white/5 hover:bg-[#2F2F40] hover:ring-[#6A56E4]/40 transition-colors flex items-center gap-4 cursor-pointer"
                  >
                    {meta ? (
                      <div className="flex items-center justify-center w-10 h-10 shrink-0">
                        <Image
                          src={meta.icon}
                          alt={`${meta.label} logo`}
                          width={36}
                          height={36}
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center w-10 h-10 shrink-0 rounded-lg bg-[#242433] text-[#D2D2FF] text-sm font-bold">
                        {(api.exchange ?? '?').slice(0, 1).toUpperCase()}
                      </div>
                    )}

                    <div className="min-w-0 flex-1">
                      <p className="text-[#D2D2FF] text-sm font-semibold truncate">
                        {label}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <span
                          className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#242433] font-semibold"
                          style={{ color: meta?.accent ?? '#8c8ca0' }}
                        >
                          {api.exchange}
                        </span>
                      </div>
                    </div>

                    <span
                      aria-hidden
                      className="text-[#6A56E4] opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M9 6l6 6-6 6" />
                      </svg>
                    </span>

                    <button
                      type="button"
                      onClick={(e) => handleDelete(e, api.id)}
                      disabled={deleteApi.isPending}
                      className="shrink-0 p-2 rounded-lg text-[#8c8ca0] hover:text-red-400 hover:bg-red-400/10 transition-colors"
                      aria-label="Видалити API"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>

                  {deletingId === api.id && (
                    <div className="mt-2 flex items-center gap-3 p-3 rounded-lg bg-[#2F2F40] ring-1 ring-red-400/20">
                      <p className="text-sm text-[#D2D2FF] flex-1">
                        Видалити цей API?
                      </p>
                      <button
                        type="button"
                        onClick={() => confirmDelete(api.id)}
                        disabled={deleteApi.isPending}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors flex items-center gap-1.5"
                      >
                        {deleteApi.isPending && (
                          <Triangle visible height={12} width={12} color="#fff" ariaLabel="deleting" />
                        )}
                        Так
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeletingId(null)}
                        disabled={deleteApi.isPending}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-[#1D1D2A] text-[#8c8ca0] hover:text-[#D2D2FF] transition-colors"
                      >
                        Ні
                      </button>
                    </div>
                  )}
                </li>
              )
            })}
          </ul>
        )}

      </div>
    </div>
  )
}
