import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'

import { SurveyItem } from '@/presentation/pages/survey-list/components'
import { IconName } from '@/presentation/components'
import { LoadSurveyList } from '@/domain/usecases'
import { mockSurveyModel } from '@/tests/data/mocks'

const makeSut = (survey: LoadSurveyList.Model): void => {
  render(
    <SurveyItem survey={survey} />
  )
}

describe('SurveyItem Component', () => {
  let survey: LoadSurveyList.Model

  beforeEach(() => {
    survey = mockSurveyModel()
  })

  afterEach(cleanup)

  test('should render with correct values', () => {
    const { getByTestId } = screen
    survey.didAnswer = true
    survey.date = new Date('2021-01-10T00:00:00')

    makeSut(survey)

    expect(getByTestId('icon')).toHaveProperty('src', IconName.thumbUp)
    expect(getByTestId('question')).toHaveTextContent(survey.question)
    expect(getByTestId('day')).toHaveTextContent('10')
    expect(getByTestId('month')).toHaveTextContent('jan')
    expect(getByTestId('year')).toHaveTextContent('2021')
  })
})
