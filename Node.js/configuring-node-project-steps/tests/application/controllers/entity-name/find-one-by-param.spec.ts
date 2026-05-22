import { FindOneByParamEntityNameController } from '@/application/controllers/entity-name'
import { EntityNameModel } from '@/domain/models'
import {
  IFindOneByParamEntityNameDTO,
  IFindOneByParamEntityNameService,
} from '@/domain/use-cases/entity-name'
// eslint-disable-next-line import/no-extraneous-dependencies
import { mock, MockProxy } from 'jest-mock-extended'

describe('FindOneByParam entity-name Controller', () => {
  let findOneByParamEntityNameService: MockProxy<IFindOneByParamEntityNameService>
  let findOneByParamMockResponse: EntityNameModel
  let findOneByParamEntityNameDTO: IFindOneByParamEntityNameDTO
  let sut: FindOneByParamEntityNameController

  beforeAll(() => {
    findOneByParamMockResponse = {
      id: 'entityName_id',
      example: 'example',
    }
    findOneByParamEntityNameDTO = { example: 'example' }
    findOneByParamEntityNameService = mock()
    findOneByParamEntityNameService.handle.mockResolvedValue(
      findOneByParamMockResponse
    )
  })

  beforeEach(() => {
    sut = new FindOneByParamEntityNameController(
      findOneByParamEntityNameService
    )
  })

  it('should call findOneByParamEntityNameService with correct params', async () => {
    await sut.perform(findOneByParamEntityNameDTO)

    expect(findOneByParamEntityNameService.handle).toHaveBeenCalledWith(
      findOneByParamEntityNameDTO
    )
    expect(findOneByParamEntityNameService.handle).toHaveBeenCalledTimes(1)
  })

  it('should rethrow if findOneByParamEntityNameService.handle throws', async () => {
    findOneByParamEntityNameService.handle.mockRejectedValueOnce(
      new Error('service_error')
    )

    const promise = sut.perform(findOneByParamEntityNameDTO)

    await expect(promise).rejects.toThrow(new Error('service_error'))
  })

  it('should return 200 and a entityName object on success', async () => {
    const httpResponse = await sut.perform(findOneByParamEntityNameDTO)

    expect(httpResponse).toEqual({
      statusCode: 200,
      data: findOneByParamMockResponse,
    })
  })
})
