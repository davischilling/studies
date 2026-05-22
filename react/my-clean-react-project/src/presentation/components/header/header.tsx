import { useLogout } from '@/presentation/hooks'
import {
  // Logo,
  currentAccountState
} from '@/presentation/components'
import Styles from './header-styles.scss'

import React, { memo } from 'react'
import { useRecoilValue } from 'recoil'

const Header: React.FC = () => {
  const { getCurrentAccount } = useRecoilValue(currentAccountState)
  const logout = useLogout()
  const buttonClick = (e: React.MouseEvent<HTMLAnchorElement, MouseEvent>): void => {
    e.preventDefault()
    logout()
  }

  return (
    <header className={Styles.headerWrap}>
      <div className={Styles.headerContent}>
        {/* <Logo /> */}
        <div className={Styles.logoutWrap}>
          <span data-testid="username">{getCurrentAccount().name}</span>
          <a data-testid="logout" href="#" onClick={buttonClick}>Sair</a>
        </div>
      </div>
    </header>
  )
}

export default memo(Header)
