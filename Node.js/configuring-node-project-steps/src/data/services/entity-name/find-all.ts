import { IRepository as EntityNameDbRepo } from '@/data/contracts'
import { EntityNameModel } from '@/domain/models'
import {
  IFindAllEntityNameService,
  FindAllEntityNameUseCase,
} from '@/domain/use-cases/entity-name'

export class FindAllEntityNameService implements IFindAllEntityNameService {
  constructor(
    private readonly entityNameAccountRepo: EntityNameDbRepo<EntityNameModel>
  ) {}

  async handle(
    params: FindAllEntityNameUseCase.input
  ): Promise<FindAllEntityNameUseCase.output> {
    const { items, data } = await this.entityNameAccountRepo.find(params)
    return {
      items,
      data,
    }
  }
}
