import { FindByIdEntityNameController } from '@/application/controllers/entity-name/find-by-id'
import { EntityNameModel } from '@/domain/models'
import {
  IFindByIdEntityNameService,
  IFindByIdEntityNameDTO,
} from '@/domain/use-cases/entity-name'
// eslint-disable-next-line import/no-extraneous-dependencies
import { mock, MockProxy } from 'jest-mock-extended'

describe('FindById entity-name Controller', () => {
  let findByIdEntityNameService: MockProxy<IFindByIdEntityNameService>
  let findByIdMockResponse: EntityNameModel
  let findByIdEntityNameDTO: IFindByIdEntityNameDTO
  let sut: FindByIdEntityNameController

  beforeAll(() => {
    findByIdMockResponse = {
      id: 'entityName_id',
      example: 'example',
    }
    findByIdEntityNameDTO = { id: 'entityName_id' }
    findByIdEntityNameService = mock()
    findByIdEntityNameService.handle.mockResolvedValue(findByIdMockResponse)
  })

  beforeEach(() => {
    sut = new FindByIdEntityNameController(findByIdEntityNameService)
  })

  it('should call findByIdEntityNameService with correct params', async () => {
    await sut.perform(findByIdEntityNameDTO)

    expect(findByIdEntityNameService.handle).toHaveBeenCalledWith(
      findByIdEntityNameDTO
    )
    expect(findByIdEntityNameService.handle).toHaveBeenCalledTimes(1)
  })

  it('should rethrow if findByIdEntityNameService.handle throws', async () => {
    findByIdEntityNameService.handle.mockRejectedValueOnce(
      new Error('service_error')
    )

    const promise = sut.perform(findByIdEntityNameDTO)

    await expect(promise).rejects.toThrow(new Error('service_error'))
  })

  it('should return 200 and a entityName object on success', async () => {
    const httpResponse = await sut.perform(findByIdEntityNameDTO)

    expect(httpResponse).toEqual({
      statusCode: 200,
      data: findByIdMockResponse,
    })
  })
})
