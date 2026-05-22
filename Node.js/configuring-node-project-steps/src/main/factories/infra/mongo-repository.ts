import { MongoDbRepository } from '@/infra/mongodb/repository/mongodb'

export const makeMongoDbRepository = async (
  entity: string,
  entityClass: any
): Promise<MongoDbRepository<typeof entityClass>> => {
  const repo = await MongoDbRepository.init<typeof entityClass>(
    '@/infra/mongodb/schemas',
    entity
  )
  return repo
}
