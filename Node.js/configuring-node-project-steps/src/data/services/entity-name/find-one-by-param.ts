import { IRepository as EntityNameDbRepo } from '@/data/contracts'
import { EntityNameModel } from '@/domain/models'
import {
  IFindOneByParamEntityNameService,
  FindOneByParamEntityNameUseCase,
} from '@/domain/use-cases/entity-name'

export class FindOneByParamEntityNameService
  implements IFindOneByParamEntityNameService
{
  constructor(
    private readonly entityNameAccountRepo: EntityNameDbRepo<EntityNameModel>
  ) {}

  async handle(
    params: FindOneByParamEntityNameUseCase.input
  ): Promise<FindOneByParamEntityNameUseCase.output> {
    const entityName = await this.entityNameAccountRepo.findOneByParam(params)
    if (!entityName) {
      throw new Error('not_found')
    }
    return entityName
  }
}
