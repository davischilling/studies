import EntityName from '@/data/entities/entity-name'
import { CreateEntityNameService } from '@/data/services'
import { ICreateEntityNameService } from '@/domain/use-cases/entity-name'
import { MongoDbRepoTypes } from '@/main/types/mongodb-repos'

import { makeMongoDbRepository } from '../../infra/mongo-repository'

export const makeCreateEntityNameService =
  async (): Promise<ICreateEntityNameService> => {
    const repo = await makeMongoDbRepository(
      MongoDbRepoTypes.entityName,
      EntityName
    )
    const service = new CreateEntityNameService(repo)
    return service
  }
