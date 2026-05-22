import { IRepository as EntityNameDbRepo } from '@/data/contracts'
import { EntityNameModel } from '@/domain/models'
import {
  IDeleteEntityNameService,
  DeleteEntityNameUseCase,
} from '@/domain/use-cases/entity-name'

export class DeleteEntityNameService implements IDeleteEntityNameService {
  constructor(
    private readonly entityNameAccountRepo: EntityNameDbRepo<EntityNameModel>
  ) {}

  async handle({ id }: DeleteEntityNameUseCase.input): Promise<void> {
    const updatedEntityNameId =
      await this.entityNameAccountRepo.findByIdAndDelete(id)
    if (!updatedEntityNameId) {
      throw new Error('not_found')
    }
  }
}
