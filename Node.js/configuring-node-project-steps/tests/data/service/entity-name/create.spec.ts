import { IRepository as EntityNameDbRepo } from '@/data/contracts'
import EntityName from '@/data/entities/entity-name'
import { CreateEntityNameService } from '@/data/services/entity-name'
import { EntityNameModel } from '@/domain/models'
import {
  ICreateEntityNameDTO,
  ICreateEntityNameService,
} from '@/domain/use-cases/entity-name'
// eslint-disable-next-line import/no-extraneous-dependencies
import { mock, MockProxy } from 'jest-mock-extended'

jest.mock('@/data/entities/entity-name')

describe('Create EntityName', () => {
  let entityNameAccountRepo: MockProxy<EntityNameDbRepo<EntityNameModel>>
  let createEntityNameDTO: ICreateEntityNameDTO
  let entityName: EntityName
  let sut: ICreateEntityNameService

  beforeAll(() => {
    createEntityNameDTO = {
      example: 'example',
    }
    entityNameAccountRepo = mock()
    entityName = new EntityName(createEntityNameDTO)
  })

  beforeEach(() => {
    sut = new CreateEntityNameService(entityNameAccountRepo)
  })

  it('Should call entityName class constructor', async () => {
    await sut.handle(createEntityNameDTO)

    expect(EntityName).toHaveBeenCalledWith(createEntityNameDTO)
    expect(EntityName).toHaveBeenCalledTimes(1)
  })

  it('should call EntityNameRepo.create with EntityName entity', async () => {
    await sut.handle(createEntityNameDTO)

    expect(entityNameAccountRepo.create).toHaveBeenCalledWith(entityName)
    expect(entityNameAccountRepo.create).toHaveBeenCalledTimes(1)
  })

  it('should rethrow if EntityNameAccountRepo.create throws', async () => {
    entityNameAccountRepo.create.mockRejectedValueOnce(new Error('repo_error'))

    const promise = sut.handle(createEntityNameDTO)

    await expect(promise).rejects.toThrow(new Error('repo_error'))
  })
})
