import { IRepository as EntityNameDbRepo } from '@/data/contracts'
import EntityName from '@/data/entities/entity-name'
import { EntityNameModel } from '@/domain/models'
import {
  ICreateEntityNameService,
  CreateEntityNameUseCase,
} from '@/domain/use-cases/entity-name'

export class CreateEntityNameService implements ICreateEntityNameService {
  constructor(
    private readonly entityNameAccountRepo: EntityNameDbRepo<EntityNameModel>
  ) {}

  async handle(params: CreateEntityNameUseCase.input): Promise<void> {
    const entityName = new EntityName(params)
    await this.entityNameAccountRepo.create(entityName)
  }
}
