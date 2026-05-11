'use client'

/**
 * TradingBotsLanding — orchestrates the default `/myCabinet/tradingBots` view
 * (no `?step=` param). Decision tree:
 *
 *   apis or robots loading or pending   → loader
 *   robots fetch errored                → <LandingTabs /> (let RobotsList
 *                                          surface the error rather than
 *                                          downgrading to a creation form)
 *   ≥1 robot                            → <LandingTabs />
 *   apisCount === 0                     → <ExchangePicker />
 *   ≥1 API && 0 robots                  → <RobotCreationFormWithSelector />
 *
 * Robots come from `GET /statistics/robots/users`; no local list.
 *
 * Why `isPending` and not just `isLoading`: TanStack Query's `isLoading` is
 * `false` while a query is disabled (waiting for `useAlgonixSession` to mark
 * the token ready). Without `isPending`, we'd see one frame with `data =
 * undefined, robotsCount = 0` and route to the creation form before the
 * fetch ever runs.
 */
import React from 'react'
import { Triangle } from 'react-loader-spinner'
import useUserApis from '@/hooks/TradingBots/useUserApis'
import useUserRobots from '@/hooks/TradingBots/useUserRobots'
import ExchangePicker from './ExchangePicker'
import RobotCreationFormWithSelector from './RobotCreationFormWithSelector'
import LandingTabs from './LandingTabs'

export default function TradingBotsLanding() {
  const apisQuery = useUserApis()
  const robotsQuery = useUserRobots()

  const apisFetching = apisQuery.isLoading || apisQuery.isPending
  const robotsFetching = robotsQuery.isLoading || robotsQuery.isPending

  if (apisFetching || robotsFetching) {
    return (
      <div className="flex items-center justify-center py-10">
        <Triangle
          visible={true}
          height={32}
          width={32}
          color="#6A56E4"
          ariaLabel="triangle-loading"
        />
      </div>
    )
  }

  // Don't silently downgrade to a creation form when the robots fetch failed —
  // the user may actually have robots we just couldn't load.
  if (robotsQuery.error) {
    return <LandingTabs />
  }

  const apisCount = apisQuery.data?.length ?? 0
  const robotsCount = robotsQuery.data?.length ?? 0

  if (robotsCount >= 1) {
    return <LandingTabs />
  }

  if (apisCount >= 1) {
    return <RobotCreationFormWithSelector />
  }

  return <ExchangePicker />
}
