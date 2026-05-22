import { IRepository as EntityNameDbRepo } from '@/data/contracts'
import EntityName from '@/data/entities/entity-name'
import { EntityNameModel } from '@/domain/models'
import {
  IUpdateEntityNameService,
  UpdateEntityNameUseCase,
} from '@/domain/use-cases/entity-name'

export class UpdateEntityNameService implements IUpdateEntityNameService {
  constructor(
    private readonly entityNameAccountRepo: EntityNameDbRepo<EntityNameModel>
  ) {}

  async handle(params: UpdateEntityNameUseCase.input): Promise<void> {
    const updatedEntityName = new EntityName(params)
    const updatedEntityNameId =
      await this.entityNameAccountRepo.findByIdAndUpdate(
        params.id,
        updatedEntityName
      )
    if (!updatedEntityNameId) {
      throw new Error('not_found')
    }
  }
}
