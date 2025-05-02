import Image from 'next/image'
import React from 'react'

import './IconWithToolTip.scss'

interface Props {
  imgPath: string
  title: string
}

const IconWithToolTip: React.FC<Props> = ({ imgPath, title }) => {
  return (

    <div className="custom-tooltip" title={title}>
      <Image
        src={imgPath}
        alt="icon"
        width={20}
        height={20}
        className="w-5 h-5"
      />
    </div>
  )
}

export default IconWithToolTip
