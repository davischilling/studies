export interface ICreateEntityNameDTO {
  example: string
}

export namespace CreateEntityNameUseCase {
  export type input = ICreateEntityNameDTO
}

export type ICreateEntityNameService = {
  handle: (params: ICreateEntityNameDTO) => Promise<void>
}
