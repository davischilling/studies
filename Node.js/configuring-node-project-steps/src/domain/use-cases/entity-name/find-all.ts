import { EntityNameModel } from '@/domain/models'

export interface IFindAllEntityNameResponse {
  items: number
  data: EntityNameModel[]
}

export namespace FindAllEntityNameUseCase {
  export type input = any
  export type output = IFindAllEntityNameResponse
}

export type IFindAllEntityNameService = {
  handle: (
    params?: FindAllEntityNameUseCase.input
  ) => Promise<FindAllEntityNameUseCase.output>
}
