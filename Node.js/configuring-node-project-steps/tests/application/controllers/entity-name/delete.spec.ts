import { DeleteEntityNameController } from '@/application/controllers/entity-name'
import {
  IDeleteEntityNameDTO,
  IDeleteEntityNameService,
} from '@/domain/use-cases/entity-name'
// eslint-disable-next-line import/no-extraneous-dependencies
import { mock, MockProxy } from 'jest-mock-extended'

describe('Delete entity-name Controller', () => {
  let deleteEntityNameDTO: IDeleteEntityNameDTO
  let deleteEntityNameService: MockProxy<IDeleteEntityNameService>
  let sut: DeleteEntityNameController

  beforeAll(() => {
    deleteEntityNameDTO = { id: 'entity_id' }
    deleteEntityNameService = mock()
  })

  beforeEach(() => {
    sut = new DeleteEntityNameController(deleteEntityNameService)
  })

  it('should call deleteEntityNameService with correct params', async () => {
    await sut.perform(deleteEntityNameDTO)

    expect(deleteEntityNameService.handle).toHaveBeenCalledWith(
      deleteEntityNameDTO
    )
    expect(deleteEntityNameService.handle).toHaveBeenCalledTimes(1)
  })

  it('should rethrow if deleteEntityNameService.handle throws', async () => {
    deleteEntityNameService.handle.mockRejectedValueOnce(
      new Error('service_error')
    )

    const promise = sut.perform(deleteEntityNameDTO)

    await expect(promise).rejects.toThrow(new Error('service_error'))
  })

  it('should return 200 and entityName confirmation message on success', async () => {
    const httpResponse = await sut.perform(deleteEntityNameDTO)

    expect(httpResponse).toEqual({
      statusCode: 200,
      data: { message: 'entityName deleted' },
    })
  })
})
