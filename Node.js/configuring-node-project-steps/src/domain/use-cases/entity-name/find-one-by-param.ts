import { EntityNameModel } from '@/domain/models'

export interface IFindOneByParamEntityNameDTO {
  example?: string
}

export namespace FindOneByParamEntityNameUseCase {
  export type input = IFindOneByParamEntityNameDTO
  export type output = EntityNameModel
}

export type IFindOneByParamEntityNameService = {
  handle: (
    params: FindOneByParamEntityNameUseCase.input
  ) => Promise<FindOneByParamEntityNameUseCase.output>
}
