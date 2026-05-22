import EntityName from '@/data/entities/entity-name'
import { FindOneByParamEntityNameService } from '@/data/services'
import { IFindOneByParamEntityNameService } from '@/domain/use-cases/entity-name'
import { MongoDbRepoTypes } from '@/main/types/mongodb-repos'

import { makeMongoDbRepository } from '../../infra/mongo-repository'

export const makeFindOneByParamEntityNameService =
  async (): Promise<IFindOneByParamEntityNameService> => {
    const repo = await makeMongoDbRepository(
      MongoDbRepoTypes.entityName,
      EntityName
    )
    const service = new FindOneByParamEntityNameService(repo)
    return service
  }
