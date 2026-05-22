import {
  Footer, Header,
  Error
} from '@/presentation/components'
import Styles from './survey-list-styles.scss'
import {
  SurveyListItems,
  surveyListState
} from './components'
import { LoadSurveyList } from '@/domain/usecases'
import { useErrorHandler } from '@/presentation/hooks'

import React, { useEffect } from 'react'
import { useRecoilState, useResetRecoilState } from 'recoil'

type Props = {
  loadSurveyList: LoadSurveyList
}

const SurveyList: React.FC<Props> = ({ loadSurveyList }: Props) => {
  const resetSurveyListState = useResetRecoilState(surveyListState)
  const [state, setState] = useRecoilState(surveyListState)
  const handleError = useErrorHandler((error: Error) => {
    setState({ ...state, error: error.message })
  })
  const reload = (): void => setState(old => ({ surveys: [], error: '', reload: !old.reload }))

  useEffect(() => resetSurveyListState(), [])
  useEffect(() => {
    loadSurveyList.loadAll()
      .then(surveys => setState({ ...state, surveys }))
      .catch(handleError)
  }, [state.reload])

  return (
    <div className={Styles.surveyListWrap}>
      <Header />
      <div className={Styles.contentWrap}>
        <h2>Snapout.it</h2>
        { state.error
          ? <Error error={state.error} reload={reload} />
          : <SurveyListItems surveys={state.surveys} />
        }
      </div>
      <Footer />
    </div>
  )
}

export default SurveyList
