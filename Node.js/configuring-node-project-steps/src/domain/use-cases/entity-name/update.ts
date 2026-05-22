export interface IUpdateEntityNameDTO {
  id: string
  example: string
}

export namespace UpdateEntityNameUseCase {
  export type input = IUpdateEntityNameDTO
}

export type IUpdateEntityNameService = {
  handle: (params: IUpdateEntityNameDTO) => Promise<void>
}
