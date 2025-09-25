import React from 'react'

const LockIcon: React.FC<{ size?: number; className?: string }> = ({ 
	size = 18, 
	className = "" 
}) => {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			xmlns="http://www.w3.org/2000/svg"
			className={className}
		>
			<path
				d="M6 10V8C6 5.79086 7.79086 4 10 4H14C16.2091 4 18 5.79086 18 8V10M6 10H4C3.44772 10 3 10.4477 3 11V19C3 19.5523 3.44772 20 4 20H20C20.5523 20 21 19.5523 21 19V11C21 10.4477 20.5523 10 20 10H18M6 10H18"
				stroke="currentColor"
				strokeWidth="2"
				strokeLinecap="round"
				strokeLinejoin="round"
			/>
			<circle
				cx="12"
				cy="15"
				r="2"
				stroke="currentColor"
				strokeWidth="2"
			/>
		</svg>
	)
}

export default LockIcon
