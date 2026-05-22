import EntityName from '@/data/entities/entity-name'
import { FindAllEntityNameService } from '@/data/services'
import { IFindAllEntityNameService } from '@/domain/use-cases/entity-name'
import { MongoDbRepoTypes } from '@/main/types/mongodb-repos'

import { makeMongoDbRepository } from '../../infra/mongo-repository'

export const makeFindAllEntityNameService =
  async (): Promise<IFindAllEntityNameService> => {
    const repo = await makeMongoDbRepository(
      MongoDbRepoTypes.entityName,
      EntityName
    )
    const service = new FindAllEntityNameService(repo)
    return service
  }
