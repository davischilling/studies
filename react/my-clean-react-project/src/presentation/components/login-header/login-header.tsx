// import { Logo } from '@/presentation/components'
import Styles from './login-header-styles.scss'

import React, { memo } from 'react'

const LoginHeader: React.FC = () => {
  return (
    <header className={Styles.headerWrap}>
      {/* <Logo /> */}
      <h1 className={Styles.headerTittle}>Snapout - Dashboard</h1>
    </header>
  )
}

export default memo(LoginHeader)
