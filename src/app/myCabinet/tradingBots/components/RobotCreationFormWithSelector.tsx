'use client'

import React, { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import useUserApis from '@/hooks/TradingBots/useUserApis'
import useUserRobots from '@/hooks/TradingBots/useUserRobots'
import BackButton from './BackButton'
import RobotCreationForm from './RobotCreationForm'

const truncate = (s: string, max = 12) =>
  s.length <= max ? s : `${s.slice(0, max)}…`

export default function RobotCreationFormWithSelector() {
  const searchParams = useSearchParams()
  const apiIdFromUrl = searchParams.get('apiId') ?? ''

  const { data: apis } = useUserApis()
  const apisList = apis ?? []

  const { data: robots } = useUserRobots()
  const hasRobots = (robots ?? []).length > 0

  const [selectedApiId, setSelectedApiId] = useState<string>('')

  useEffect(() => {
    if (apisList.length === 0) return
    const stillExists = apisList.some((a) => a.id === selectedApiId)
    if (stillExists) return

    const fromUrl = apiIdFromUrl && apisList.find((a) => a.id === apiIdFromUrl)
    setSelectedApiId(fromUrl ? fromUrl.id : apisList[0].id)
  }, [apisList, selectedApiId, apiIdFromUrl])

  const selectedApi = apisList.find((a) => a.id === selectedApiId) ?? null

  if (apisList.length === 0 || !selectedApi) {
    return null
  }

  return (
    <div className="w-full">
      {hasRobots && <BackButton />}
      <h6 className="text-[#D2D2FF] text-xl font-semibold mt-[30px]">
        Створення робота
      </h6>
      <div className="mt-4 p-6 bg-[#242433] rounded-2xl">
        <label className="text-[#D2D2FF] text-sm font-medium block">
          Виберіть API
        </label>
        <select
          value={selectedApiId}
          onChange={(e) => setSelectedApiId(e.target.value)}
          className="w-full mt-2 p-3 border rounded-lg text-gray-800 focus:ring focus:ring-[#6A56E4] focus:outline-none"
        >
          {apisList.map((api) => {
            const label = api.title?.trim() ? api.title : truncate(api.key)
            return (
              <option key={api.id} value={api.id}>
                {label} · {api.exchange}
              </option>
            )
          })}
        </select>

        <RobotCreationForm
          key={selectedApiId}
          apiId={selectedApi.id}
          exchange={selectedApi.exchange}
        />
      </div>
    </div>
  )
}
