import { IRepository as EntityNameDbRepo } from '@/data/contracts'
import { FindByIdEntityNameService } from '@/data/services/entity-name'
import { EntityNameModel } from '@/domain/models'
import {
  IFindByIdEntityNameDTO,
  IFindByIdEntityNameService,
} from '@/domain/use-cases/entity-name'
// eslint-disable-next-line import/no-extraneous-dependencies
import { mock, MockProxy } from 'jest-mock-extended'

describe('FindById EntityName', () => {
  let entityNameAccountRepo: MockProxy<EntityNameDbRepo<EntityNameModel>>
  let findByIdEntityNameDTO: IFindByIdEntityNameDTO
  let sut: IFindByIdEntityNameService
  let mockedReturnValue: EntityNameModel

  beforeAll(() => {
    findByIdEntityNameDTO = {
      id: 'entityName_id',
    }
    mockedReturnValue = {
      id: 'entityName_id',
      example: 'example',
    }
    entityNameAccountRepo = mock()
    entityNameAccountRepo.findById.mockResolvedValue(mockedReturnValue)
  })

  beforeEach(() => {
    sut = new FindByIdEntityNameService(entityNameAccountRepo)
  })

  it('should call EntityNameRepo.findById with EntityName entity', async () => {
    await sut.handle(findByIdEntityNameDTO)

    const { id } = findByIdEntityNameDTO

    expect(entityNameAccountRepo.findById).toHaveBeenCalledWith(id)
    expect(entityNameAccountRepo.findById).toHaveBeenCalledTimes(1)
  })

  it('should throw if EntityNameAccountRepo does not find any collection to delete', async () => {
    entityNameAccountRepo.findById.mockResolvedValueOnce(null)

    const promise = sut.handle(findByIdEntityNameDTO)

    expect(promise).rejects.toThrow(new Error('not_found'))
  })

  it('should rethrow if EntityNameAccountRepo.findById throws', async () => {
    entityNameAccountRepo.findById.mockRejectedValueOnce(
      new Error('repo_error')
    )

    const promise = sut.handle(findByIdEntityNameDTO)

    await expect(promise).rejects.toThrow(new Error('repo_error'))
  })

  it('should return an entityName on success', async () => {
    const response = await sut.handle(findByIdEntityNameDTO)

    expect(response).toEqual(mockedReturnValue)
  })
})
