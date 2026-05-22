import { IRepository as EntityNameDbRepo } from '@/data/contracts'
import { FindAllEntityNameService } from '@/data/services/entity-name'
import { EntityNameModel } from '@/domain/models'
import {
  IFindAllEntityNameService,
  IFindAllEntityNameResponse,
} from '@/domain/use-cases/entity-name'
// eslint-disable-next-line import/no-extraneous-dependencies
import { mock, MockProxy } from 'jest-mock-extended'

describe('FindAll EntityName', () => {
  let entityNameAccountRepo: MockProxy<EntityNameDbRepo<EntityNameModel>>
  let findAllEntityNameDTO: any
  let sut: IFindAllEntityNameService
  let mockedReturnValue: IFindAllEntityNameResponse

  beforeAll(() => {
    findAllEntityNameDTO = {
      example: 'example',
    }
    mockedReturnValue = {
      items: 1,
      data: [
        {
          id: 'entityName_id',
          example: 'example',
        },
      ],
    }
    entityNameAccountRepo = mock()
    entityNameAccountRepo.find.mockResolvedValue(mockedReturnValue)
  })

  beforeEach(() => {
    sut = new FindAllEntityNameService(entityNameAccountRepo)
  })

  it('should call EntityNameRepo.find with EntityName entity', async () => {
    await sut.handle(findAllEntityNameDTO)

    expect(entityNameAccountRepo.find).toHaveBeenCalledWith(
      findAllEntityNameDTO
    )
    expect(entityNameAccountRepo.find).toHaveBeenCalledTimes(1)
  })

  it('should rethrow if EntityNameAccountRepo.findAll throws', async () => {
    entityNameAccountRepo.find.mockRejectedValueOnce(new Error('repo_error'))

    const promise = sut.handle(findAllEntityNameDTO)

    await expect(promise).rejects.toThrow(new Error('repo_error'))
  })

  it('should return an object with items and data properties on success', async () => {
    const response = await sut.handle(findAllEntityNameDTO)

    expect(response).toEqual(mockedReturnValue)
  })

  it('should return zero items and an empty data on success', async () => {
    const mockedResponse = {
      items: 0,
      data: [],
    }
    entityNameAccountRepo.find.mockResolvedValueOnce(mockedResponse)

    const response = await sut.handle({})

    expect(response).toEqual(mockedResponse)
  })
})
