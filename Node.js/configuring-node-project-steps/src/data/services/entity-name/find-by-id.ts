import { IRepository as EntityNameDbRepo } from '@/data/contracts'
import { EntityNameModel } from '@/domain/models'
import {
  IFindByIdEntityNameService,
  FindByIdEntityNameUseCase,
} from '@/domain/use-cases/entity-name'

export class FindByIdEntityNameService implements IFindByIdEntityNameService {
  constructor(
    private readonly entityNameAccountRepo: EntityNameDbRepo<EntityNameModel>
  ) {}

  async handle({
    id,
  }: FindByIdEntityNameUseCase.input): Promise<FindByIdEntityNameUseCase.output> {
    const result = await this.entityNameAccountRepo.findById(id)
    if (!result) {
      throw new Error('not_found')
    }
    return result
  }
}
