import EntityName from '@/data/entities/entity-name'
import { FindByIdEntityNameService } from '@/data/services'
import { IFindByIdEntityNameService } from '@/domain/use-cases/entity-name'
import { MongoDbRepoTypes } from '@/main/types/mongodb-repos'

import { makeMongoDbRepository } from '../../infra/mongo-repository'

export const makeFindByIdEntityNameService =
  async (): Promise<IFindByIdEntityNameService> => {
    const repo = await makeMongoDbRepository(
      MongoDbRepoTypes.entityName,
      EntityName
    )
    const service = new FindByIdEntityNameService(repo)
    return service
  }
