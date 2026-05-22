import EntityName from '@/data/entities/entity-name'
import { UpdateEntityNameService } from '@/data/services'
import { IUpdateEntityNameService } from '@/domain/use-cases/entity-name'
import { MongoDbRepoTypes } from '@/main/types/mongodb-repos'

import { makeMongoDbRepository } from '../../infra/mongo-repository'

export const makeUpdateEntityNameService =
  async (): Promise<IUpdateEntityNameService> => {
    const repo = await makeMongoDbRepository(
      MongoDbRepoTypes.entityName,
      EntityName
    )
    const service = new UpdateEntityNameService(repo)
    return service
  }
