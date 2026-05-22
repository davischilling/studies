export type SurveyModel = {
  id: string
  question: string
  answers: SurveyAnwerModel[]
  date: Date
  didAnswer: boolean
}

export type SurveyAnwerModel = {
  image?: string
  answer: string
}
