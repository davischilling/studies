import { IRepository as EntityNameDbRepo } from '@/data/contracts'
import { FindOneByParamEntityNameService } from '@/data/services/entity-name'
import { EntityNameModel } from '@/domain/models'
import {
  IFindOneByParamEntityNameDTO,
  IFindOneByParamEntityNameService,
} from '@/domain/use-cases/entity-name'
// eslint-disable-next-line import/no-extraneous-dependencies
import { mock, MockProxy } from 'jest-mock-extended'

describe('FindOneByParam EntityName', () => {
  let entityNameAccountRepo: MockProxy<EntityNameDbRepo<EntityNameModel>>
  let findOneByParamEntityNameDTO: IFindOneByParamEntityNameDTO
  let sut: IFindOneByParamEntityNameService
  let mockedReturnValue: EntityNameModel

  beforeAll(() => {
    findOneByParamEntityNameDTO = {
      example: 'example',
    }
    mockedReturnValue = {
      id: 'entityName_id',
      example: 'example',
    }
    entityNameAccountRepo = mock()
    entityNameAccountRepo.findOneByParam.mockResolvedValue(mockedReturnValue)
  })

  beforeEach(() => {
    sut = new FindOneByParamEntityNameService(entityNameAccountRepo)
  })

  it('should call EntityNameRepo.findOneByParam with correct params', async () => {
    await sut.handle(findOneByParamEntityNameDTO)

    expect(entityNameAccountRepo.findOneByParam).toHaveBeenCalledWith(
      findOneByParamEntityNameDTO
    )
    expect(entityNameAccountRepo.findOneByParam).toHaveBeenCalledTimes(1)
  })

  it('should throw if EntityNameAccountRepo does not find any collection to findOneByParam', async () => {
    entityNameAccountRepo.findOneByParam.mockResolvedValueOnce(null)

    const promise = sut.handle(findOneByParamEntityNameDTO)

    expect(promise).rejects.toThrow(new Error('not_found'))
  })

  it('should rethrow if EntityNameAccountRepo.findOneByParam throws', async () => {
    entityNameAccountRepo.findOneByParam.mockRejectedValueOnce(
      new Error('repo_error')
    )

    const promise = sut.handle(findOneByParamEntityNameDTO)

    await expect(promise).rejects.toThrow(new Error('repo_error'))
  })
})
