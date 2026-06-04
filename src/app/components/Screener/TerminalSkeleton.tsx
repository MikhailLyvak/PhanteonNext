'use client'

import React from 'react'

// Deterministic pseudo-random so the silhouette is stable across renders and
// hydration — Math.random would tear between server and client paint.
function prng(seed: number): number {
	const x = Math.sin(seed * 9301 + 49297) * 233280
	return x - Math.floor(x)
}

const CANDLE_COUNT = 64

interface FakeCandle {
	bodyTop: number
	bodyBottom: number
	wickTop: number
	wickBottom: number
}

// A coherent silhouette comes from a random walk, not independent heights —
// that's what made the previous skeleton read as "fake bar chart" instead of
// "candles". Each candle's mid drifts from the previous one; the body sits
// around the drift, the wick stretches slightly past it.
function makeCandles(): FakeCandle[] {
	let mid = 52
	return Array.from({ length: CANDLE_COUNT }, (_, i) => {
		const drift = (prng(i + 1) - 0.5) * 8
		const next = Math.max(22, Math.min(78, mid + drift))
		const span = 2 + prng(i + 1000) * 5
		const hi = Math.max(mid, next) + prng(i + 2000) * span * 0.4
		const lo = Math.min(mid, next) - prng(i + 3000) * span * 0.4
		const wHi = hi + prng(i + 4000) * span * 1.4
		const wLo = lo - prng(i + 5000) * span * 1.4
		mid = next
		return {
			bodyTop: 100 - hi,
			bodyBottom: 100 - lo,
			wickTop: 100 - wHi,
			wickBottom: 100 - wLo,
		}
	})
}

const STYLES = `
@keyframes tsk-sweep {
	0%   { transform: translateX(-120%); }
	100% { transform: translateX(120%); }
}
@keyframes tsk-breathe {
	0%, 100% { opacity: 0.5; }
	50%      { opacity: 0.95; }
}
@keyframes tsk-rise {
	from { transform: scaleY(0.85); opacity: 0.6; }
	to   { transform: scaleY(1);    opacity: 1; }
}
.tsk-sweep { position: relative; }
.tsk-sweep::after {
	content: '';
	position: absolute;
	inset: 0;
	background: linear-gradient(110deg,
		transparent 0%,
		transparent 38%,
		rgba(138,166,255,0.05) 48%,
		rgba(210,210,255,0.10) 50%,
		rgba(138,166,255,0.05) 52%,
		transparent 62%,
		transparent 100%);
	animation: tsk-sweep 2.6s cubic-bezier(.42,0,.58,1) infinite;
	pointer-events: none;
}
.tsk-breathe { animation: tsk-breathe 2.6s ease-in-out infinite; }
.tsk-candle  { transform-origin: center; animation: tsk-rise 0.6s ease-out both; }
`

const ChartSkeleton: React.FC = () => {
	const candles = React.useMemo(() => makeCandles(), [])
	const volumes = React.useMemo(
		() => Array.from({ length: CANDLE_COUNT }, (_, i) => 12 + prng(i + 7777) * 72),
		[]
	)

	return (
		<div className='bg-[#161a22] border border-[#262b38] rounded-2xl p-3 flex flex-col min-h-0 lg:h-full overflow-hidden tsk-sweep'>
			<div className='flex items-center justify-between mb-2 gap-2'>
				<div className='flex items-center gap-3'>
					<div className='h-4 w-24 rounded-md bg-[#1d212c] tsk-breathe' />
					<div
						className='h-5 w-32 rounded-md bg-[#1d212c] tsk-breathe'
						style={{ animationDelay: '0.12s' }}
					/>
				</div>
				<div className='hidden md:flex items-center gap-1.5'>
					{[64, 56, 72, 60, 68, 56].map((w, i) => (
						<div
							key={i}
							className='h-6 rounded-lg border border-[#262b38] bg-[#1A1A28] tsk-breathe'
							style={{ width: w, animationDelay: `${i * 0.07}s` }}
						/>
					))}
				</div>
			</div>

			<div className='h-4 mb-1 flex items-center gap-4'>
				{[42, 46, 40, 44].map((w, i) => (
					<div
						key={i}
						className='h-2 rounded bg-[#1A1A28] tsk-breathe'
						style={{ width: w, animationDelay: `${i * 0.08}s` }}
					/>
				))}
			</div>

			<div className='flex-1 flex flex-col min-h-0' style={{ minHeight: 700 }}>
				<div
					className='relative w-full'
					style={{ flexGrow: 3, flexShrink: 1, flexBasis: 0, minHeight: 0 }}
				>
					<div className='absolute inset-0 pr-12' aria-hidden>
						{[0.18, 0.36, 0.54, 0.72, 0.9].map(p => (
							<div
								key={p}
								className='absolute left-0 right-0 h-px bg-[#262b38]/55'
								style={{ top: `${p * 100}%` }}
							/>
						))}
					</div>

					<div className='absolute right-0 top-2 bottom-2 w-11 flex flex-col justify-between items-end'>
						{[0, 1, 2, 3, 4].map(i => (
							<div
								key={i}
								className='h-2 rounded bg-[#1A1A28] tsk-breathe'
								style={{ width: 32 + (i % 2) * 8, animationDelay: `${i * 0.1}s` }}
							/>
						))}
					</div>

					<div className='absolute inset-y-0 left-0 right-12 flex items-stretch'>
						{candles.map((c, i) => (
							<div
								key={i}
								className='relative flex-1 mx-[1px] tsk-candle'
								style={{ animationDelay: `${i * 0.012}s` }}
							>
								<div
									className='absolute left-1/2 -translate-x-1/2 w-px bg-[#3a4055]'
									style={{
										top: `${c.wickTop}%`,
										bottom: `${100 - c.wickBottom}%`,
									}}
								/>
								<div
									className='absolute inset-x-0 rounded-[1px] border border-[#3a4055]/60'
									style={{
										top: `${c.bodyTop}%`,
										bottom: `${100 - c.bodyBottom}%`,
										background:
											'linear-gradient(180deg, #2f3548 0%, #232838 100%)',
									}}
								/>
							</div>
						))}
					</div>
				</div>

				<div className='h-6 my-1 border-y border-[#262b38]/50 flex items-center justify-between pr-12 pl-1'>
					{Array.from({ length: 7 }).map((_, i) => (
						<div
							key={i}
							className='h-2 w-10 rounded bg-[#1A1A28] tsk-breathe'
							style={{ animationDelay: `${i * 0.07}s` }}
						/>
					))}
				</div>

				<div
					className='relative w-full'
					style={{ flexGrow: 2, flexShrink: 1, flexBasis: 0, minHeight: 0 }}
				>
					<div className='absolute inset-0 pr-12' aria-hidden>
						{[0.33, 0.66].map(p => (
							<div
								key={p}
								className='absolute left-0 right-0 h-px bg-[#262b38]/55'
								style={{ top: `${p * 100}%` }}
							/>
						))}
					</div>

					<div className='absolute right-0 top-2 bottom-2 w-11 flex flex-col justify-between items-end'>
						{[0, 1, 2].map(i => (
							<div
								key={i}
								className='h-2 rounded bg-[#1A1A28] tsk-breathe'
								style={{ width: 30 + (i % 2) * 10, animationDelay: `${i * 0.1}s` }}
							/>
						))}
					</div>

					<div className='absolute inset-y-0 left-0 right-12 flex items-end'>
						{volumes.map((h, i) => (
							<div
								key={i}
								className='flex-1 mx-[1px] tsk-candle'
								style={{ animationDelay: `${i * 0.012 + 0.2}s` }}
							>
								<div
									className='rounded-t-[1px]'
									style={{
										height: `${h}%`,
										background:
											'linear-gradient(180deg, rgba(138,166,255,0.18) 0%, rgba(42,49,69,0.55) 100%)',
									}}
								/>
							</div>
						))}
					</div>
				</div>
			</div>

			<style>{STYLES}</style>
		</div>
	)
}

const FeedSkeleton: React.FC = () => {
	const rows = React.useMemo(
		() =>
			Array.from({ length: 24 }).map((_, i) => ({
				timeW: 38 + Math.floor(prng(i + 100) * 6),
				priceW: 48 + Math.floor(prng(i + 200) * 18),
				sizeW: 32 + Math.floor(prng(i + 300) * 22),
				accent: prng(i + 400) > 0.55,
			})),
		[]
	)

	return (
		<div className='bg-[#161a22] border border-[#262b38] rounded-2xl p-3 h-full min-h-0 flex flex-col overflow-hidden tsk-sweep'>
			<div className='flex items-center gap-2 px-1 pb-2'>
				<div className='h-1.5 w-1.5 rounded-full bg-[#8AA6FF] tsk-breathe' />
				<div className='h-3 w-28 rounded bg-[#1d212c] tsk-breathe' />
			</div>

			<div className='grid grid-cols-3 gap-2 bg-[#1d212c] rounded-md px-2 py-2'>
				<div className='h-2 w-8 rounded bg-[#262b38]' />
				<div className='h-2 w-12 rounded bg-[#262b38] ml-auto' />
				<div className='h-2 w-12 rounded bg-[#262b38] ml-auto' />
			</div>

			<div className='flex-1 min-h-0 overflow-hidden mt-1'>
				{rows.map((r, i) => (
					<div
						key={i}
						className='grid grid-cols-3 gap-2 items-center py-1.5 border-t border-[#262b38]/30 tsk-breathe'
						style={{ animationDelay: `${(i % 8) * 0.06}s` }}
					>
						<div className='h-2 rounded bg-[#1A1A28]' style={{ width: r.timeW }} />
						<div
							className='h-2 rounded ml-auto'
							style={{
								width: r.priceW,
								background: r.accent
									? 'linear-gradient(90deg, rgba(138,166,255,0.18), #1A1A28)'
									: '#1A1A28',
							}}
						/>
						<div
							className='h-2 rounded bg-[#1A1A28] ml-auto'
							style={{ width: r.sizeW }}
						/>
					</div>
				))}
			</div>
		</div>
	)
}

const TerminalSkeleton: React.FC = () => (
	<div className='mt-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] lg:grid-rows-[760px] gap-4'>
		<div className='flex flex-col gap-4 min-h-0'>
			<ChartSkeleton />
		</div>
		<div className='h-[420px] lg:h-full min-h-0'>
			<FeedSkeleton />
		</div>
	</div>
)

export default TerminalSkeleton
