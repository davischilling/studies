import { AccessDeniedError, UnexpectedError } from '@/data/errors'
import { LoadSurveyListStub } from '@/tests/data/mocks'
import { AccountModel } from '@/domain/models'
import { SurveyList } from '@/presentation/pages'
import { renderWithHistory } from '@/tests/presentation/mocks'

import { cleanup, fireEvent, screen, waitFor } from '@testing-library/react'
import { createMemoryHistory, MemoryHistory } from 'history'

type SutTypes = {
  loadSurveyList: LoadSurveyListStub
  history: MemoryHistory
  setCurrentAccountMock: (account: AccountModel) => void
}

const makeSut = (loadSurveyList: LoadSurveyListStub): SutTypes => {
  const history = createMemoryHistory({ initialEntries: ['/'] })
  const { setCurrentAccountMock } = renderWithHistory({
    history,
    Page: () => SurveyList({ loadSurveyList })
  })
  return {
    loadSurveyList,
    history,
    setCurrentAccountMock
  }
}

describe('SurveyList Page', () => {
  let loadSurveyList: LoadSurveyListStub
  let loadSurveyListSpy: jest.SpyInstance

  beforeEach(() => {
    loadSurveyList = new LoadSurveyListStub()
    loadSurveyListSpy = jest.spyOn(loadSurveyList, 'loadAll')
  })

  afterEach(cleanup)

  test('should render 4 empty items on start', async () => {
    makeSut(loadSurveyList)

    const surveyList = screen.getByTestId('survey-list')

    expect(surveyList.querySelectorAll('li:empty')).toHaveLength(4)
    expect(screen.queryByTestId('error')).not.toBeInTheDocument()
    await waitFor(() => surveyList)
  })

  test('should call LoadSurveyList', async () => {
    makeSut(loadSurveyList)

    expect(loadSurveyListSpy).toHaveBeenCalledTimes(1)
    expect(screen.queryByTestId('error')).not.toBeInTheDocument()
    await waitFor(() => screen.getByRole('heading'))
  })

  test('should render SurveyItems on success', async () => {
    makeSut(loadSurveyList)

    const surveyList = screen.getByTestId('survey-list')

    await waitFor(() => surveyList)

    expect(surveyList.querySelectorAll('li.surveyItemWrap')).toHaveLength(3)
  })

  test('should render Error on unexpected failure', async () => {
    const error = new UnexpectedError()
    jest.spyOn(loadSurveyList, 'loadAll').mockRejectedValueOnce(error)

    makeSut(loadSurveyList)

    await waitFor(() => screen.getByRole('heading'))

    expect(screen.queryByTestId('survey-list')).not.toBeInTheDocument()
    expect(screen.queryByTestId('error')).toHaveTextContent(error.message)
  })

  test('should logout on access denied Error', async () => {
    const error = new AccessDeniedError()
    jest.spyOn(loadSurveyList, 'loadAll').mockRejectedValueOnce(error)

    const { history, setCurrentAccountMock } = makeSut(loadSurveyList)

    await waitFor(() => screen.getByRole('heading'))

    expect(setCurrentAccountMock).toHaveBeenCalledWith(undefined)
    expect(history.location.pathname).toBe('/login')
  })

  test('should call LoadSurveyList on reload button click', async () => {
    jest.spyOn(loadSurveyList, 'loadAll').mockRejectedValueOnce(new UnexpectedError())

    makeSut(loadSurveyList)

    await waitFor(() => screen.getByRole('heading'))
    fireEvent.click(screen.getByTestId('reload'))

    expect(loadSurveyListSpy).toHaveBeenCalledTimes(2)
    await waitFor(() => screen.getByRole('heading'))
  })
})
