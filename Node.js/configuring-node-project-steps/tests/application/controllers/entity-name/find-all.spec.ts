import { FindAllEntityNameController } from '@/application/controllers/entity-name'
import {
  FindAllEntityNameUseCase,
  IFindAllEntityNameService,
} from '@/domain/use-cases/entity-name'
// eslint-disable-next-line import/no-extraneous-dependencies
import { mock, MockProxy } from 'jest-mock-extended'

describe('FindAll entity-name Controller', () => {
  let findAllEntityNameService: MockProxy<IFindAllEntityNameService>
  let findAllMockListResponse: FindAllEntityNameUseCase.output
  let findAllEntityNameDTO: any
  let sut: FindAllEntityNameController

  beforeAll(() => {
    findAllMockListResponse = {
      items: 1,
      data: [
        {
          id: 'entityName_id',
          example: 'example',
        },
      ],
    }
    findAllEntityNameDTO = {}
    findAllEntityNameService = mock()
    findAllEntityNameService.handle.mockResolvedValue(findAllMockListResponse)
  })

  beforeEach(() => {
    sut = new FindAllEntityNameController(findAllEntityNameService)
  })

  it('should call findAllEntityNameService with correct params', async () => {
    await sut.perform(findAllEntityNameDTO)

    expect(findAllEntityNameService.handle).toHaveBeenCalledWith(
      findAllEntityNameDTO
    )
    expect(findAllEntityNameService.handle).toHaveBeenCalledTimes(1)
  })

  it('should rethrow if findAllEntityNameService.handle throws', async () => {
    findAllEntityNameService.handle.mockRejectedValueOnce(
      new Error('service_error')
    )

    const promise = sut.perform(findAllEntityNameDTO)

    await expect(promise).rejects.toThrow(new Error('service_error'))
  })

  it('should return 200 and a list of entityName on success', async () => {
    const httpResponse = await sut.perform()

    expect(httpResponse).toEqual({
      statusCode: 200,
      data: findAllMockListResponse,
    })
  })
})
