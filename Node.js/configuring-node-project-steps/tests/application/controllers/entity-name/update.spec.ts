import { UpdateEntityNameController } from '@/application/controllers/entity-name'
import {
  IUpdateEntityNameDTO,
  IUpdateEntityNameService,
} from '@/domain/use-cases/entity-name'
// eslint-disable-next-line import/no-extraneous-dependencies
import { mock, MockProxy } from 'jest-mock-extended'

describe('Update entity-name Controller', () => {
  let updateEntityNameDTO: IUpdateEntityNameDTO
  let updateEntityNameService: MockProxy<IUpdateEntityNameService>
  let sut: UpdateEntityNameController

  beforeAll(() => {
    updateEntityNameDTO = {
      id: 'entityName_id',
      example: 'new_example',
    }
    updateEntityNameService = mock()
  })

  beforeEach(() => {
    sut = new UpdateEntityNameController(updateEntityNameService)
  })

  it('should call updateEntityNameService with correct params', async () => {
    await sut.perform(updateEntityNameDTO)

    expect(updateEntityNameService.handle).toHaveBeenCalledWith(
      updateEntityNameDTO
    )
    expect(updateEntityNameService.handle).toHaveBeenCalledTimes(1)
  })

  it('should rethrow if updateEntityNameService.handle throws', async () => {
    updateEntityNameService.handle.mockRejectedValueOnce(
      new Error('service_error')
    )

    const promise = sut.perform(updateEntityNameDTO)

    await expect(promise).rejects.toThrow(new Error('service_error'))
  })

  it('should return 200 and entityName update confirmation message on success', async () => {
    const httpResponse = await sut.perform(updateEntityNameDTO)

    expect(httpResponse).toEqual({
      statusCode: 200,
      data: { message: 'entityName updated' },
    })
  })
})
