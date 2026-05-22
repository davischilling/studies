import React from 'react'

import { SurveyList } from '@/presentation/pages'
import { makeRemoteLoadSurvey } from '@/main/factories/data'

export const makeSurveyListPage: React.FC = () => <SurveyList loadSurveyList={makeRemoteLoadSurvey()} />
