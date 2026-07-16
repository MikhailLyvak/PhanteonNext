'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { DEPOSIT_WALLET_TYPE } from '@/api/TradingBots/constants'
import useUserWallets from '@/hooks/TradingBots/useUserWallets'
import useCreateUserWallet from '@/hooks/TradingBots/useCreateUserWallet'
import DepositHeader from './DepositHeader'
import NetworkAssetCards from './NetworkAssetCards'
import QrCodeAddress from './QrCodeAddress'
import AddressRow from './AddressRow'
import SafetyNotice from './SafetyNotice'
import WalletPendingState from './WalletPendingState'

interface Props {
	open: boolean
	onClose: () => void
}

const DepositModal = ({ open, onClose }: Props) => {
	const wallets = useUserWallets(open)
	const createWallet = useCreateUserWallet()

	const createAttemptedRef = useRef(false)
	const [createFailed, setCreateFailed] = useState(false)

	useEffect(() => {
		if (!open) {
			createAttemptedRef.current = false
			setCreateFailed(false)
			return
		}
		const list = wallets.data
		if (!list || createAttemptedRef.current) return
		if (list.length > 0) return
		if (createWallet.isPending) return

		createAttemptedRef.current = true
		createWallet.mutate(undefined, {
			onError: () => {
				setCreateFailed(true)
			},
		})
		// `createWallet` is stable from useMutation; including it in the dep
		// list would not cause re-runs but eslint can't prove that, so mute.
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [open, wallets.data])

	useEffect(() => {
		if (!open) return
		const previous = document.body.style.overflow
		document.body.style.overflow = 'hidden'
		return () => {
			document.body.style.overflow = previous
		}
	}, [open])

	const filteredWallet = useMemo(() => {
		return wallets.data?.find(w => w.type === DEPOSIT_WALLET_TYPE) ?? null
	}, [wallets.data])

	if (!open) return null

	const isProvisioning =
		wallets.isLoading || createWallet.isPending || wallets.isFetching

	const handleRefresh = () => {
		setCreateFailed(false)
		void wallets.refetch()
	}

	return (
		<div
			className='fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm'
			onClick={onClose}
			role='dialog'
			aria-modal='true'
			aria-label='Депозит'
		>
			<div
				className='relative w-full max-w-[38.4rem] max-h-[90vh] overflow-y-auto rounded-2xl bg-[#242433] p-6 shadow-2xl'
				onClick={e => e.stopPropagation()}
			>
				<DepositHeader onClose={onClose} />
				<NetworkAssetCards />

				{filteredWallet ? (
					<>
						<div className='mt-6'>
							<QrCodeAddress value={filteredWallet.base58} />
						</div>
						<AddressRow address={filteredWallet.base58} />
						<SafetyNotice />
					</>
				) : (
					<WalletPendingState
						mode={createFailed ? 'failed' : 'pending'}
						onRefresh={handleRefresh}
						isRefreshing={isProvisioning}
					/>
				)}
			</div>
		</div>
	)
}

export default DepositModal
