export interface IDeleteEntityNameDTO {
  id: string
}

export namespace DeleteEntityNameUseCase {
  export type input = IDeleteEntityNameDTO
}

export type IDeleteEntityNameService = {
  handle: (params: IDeleteEntityNameDTO) => Promise<void>
}
