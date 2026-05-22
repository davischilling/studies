import { Spinner } from '@/presentation/components'

import React from 'react'
import Styles from './form-status-styles.scss'

type Props = {
  state: any
}

const FormStatus: React.FC<Props> = ({ state }: Props) => {
  const { isLoading, mainErrorMessage } = state

  return (
    <div data-testid="error-wrap" className={Styles.errorWrap}>
      { isLoading && <Spinner className={Styles.spinner} /> }
      { mainErrorMessage && <span data-testid="main-error" className={Styles.error}>{mainErrorMessage}</span> }
    </div>
  )
}

export default FormStatus
