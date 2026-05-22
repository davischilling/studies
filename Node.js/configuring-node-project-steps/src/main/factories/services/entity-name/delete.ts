import EntityName from '@/data/entities/entity-name'
import { DeleteEntityNameService } from '@/data/services'
import { IDeleteEntityNameService } from '@/domain/use-cases/entity-name'
import { MongoDbRepoTypes } from '@/main/types/mongodb-repos'

import { makeMongoDbRepository } from '../../infra/mongo-repository'

export const makeDeleteEntityNameService =
  async (): Promise<IDeleteEntityNameService> => {
    const repo = await makeMongoDbRepository(
      MongoDbRepoTypes.entityName,
      EntityName
    )
    const service = new DeleteEntityNameService(repo)
    return service
  }
