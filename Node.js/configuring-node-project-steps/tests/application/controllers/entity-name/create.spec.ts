import { CreateEntityNameController } from '@/application/controllers/entity-name'
import {
  ICreateEntityNameDTO,
  ICreateEntityNameService,
} from '@/domain/use-cases/entity-name'
// eslint-disable-next-line import/no-extraneous-dependencies
import { mock, MockProxy } from 'jest-mock-extended'

describe('Create entity-name Controller', () => {
  let createEntityNameDTO: ICreateEntityNameDTO
  let createEntityNameService: MockProxy<ICreateEntityNameService>
  let sut: CreateEntityNameController

  beforeAll(() => {
    createEntityNameDTO = {
      example: 'Mock Entity',
    }
    createEntityNameService = mock()
  })

  beforeEach(() => {
    sut = new CreateEntityNameController(createEntityNameService)
  })

  it('should call createEntityNameService with correct params', async () => {
    await sut.perform(createEntityNameDTO)

    expect(createEntityNameService.handle).toHaveBeenCalledWith(
      createEntityNameDTO
    )
    expect(createEntityNameService.handle).toHaveBeenCalledTimes(1)
  })

  it('should rethrow if createEntityNameService.handle throws', async () => {
    createEntityNameService.handle.mockRejectedValueOnce(
      new Error('service_error')
    )

    const promise = sut.perform(createEntityNameDTO)

    await expect(promise).rejects.toThrow(new Error('service_error'))
  })

  it('should return 201 and entityName confirmation message on success', async () => {
    const httpResponse = await sut.perform(createEntityNameDTO)

    expect(httpResponse).toEqual({
      statusCode: 201,
      data: { message: 'entityName created' },
    })
  })
})
