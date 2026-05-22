import { EntityNameModel } from '@/domain/models'

export interface IFindByIdEntityNameDTO {
  id: string
}

export namespace FindByIdEntityNameUseCase {
  export type input = IFindByIdEntityNameDTO
  export type output = EntityNameModel
}

export type IFindByIdEntityNameService = {
  handle: (
    params: FindByIdEntityNameUseCase.input
  ) => Promise<FindByIdEntityNameUseCase.output>
}
