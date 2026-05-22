import { IRepository as EntityNameDbRepo } from '@/data/contracts'
import EntityName from '@/data/entities/entity-name'
import { UpdateEntityNameService } from '@/data/services/entity-name'
import { EntityNameModel } from '@/domain/models'
import {
  IUpdateEntityNameDTO,
  IUpdateEntityNameService,
} from '@/domain/use-cases/entity-name'
// eslint-disable-next-line import/no-extraneous-dependencies
import { mock, MockProxy } from 'jest-mock-extended'

jest.mock('@/data/entities/entity-name')

describe('Update EntityName', () => {
  let entityNameAccountRepo: MockProxy<EntityNameDbRepo<EntityNameModel>>
  let updateEntityNameDTO: IUpdateEntityNameDTO
  let sut: IUpdateEntityNameService

  beforeAll(() => {
    updateEntityNameDTO = {
      id: 'entityName_id',
      example: 'update_example',
    }
    entityNameAccountRepo = mock()
    entityNameAccountRepo.findByIdAndUpdate.mockResolvedValue('entityName_id')
  })

  beforeEach(() => {
    sut = new UpdateEntityNameService(entityNameAccountRepo)
  })

  it('Should call entityName class constructor', async () => {
    await sut.handle(updateEntityNameDTO)

    expect(EntityName).toHaveBeenCalledWith(updateEntityNameDTO)
    expect(EntityName).toHaveBeenCalledTimes(1)
  })

  it('should call EntityNameRepo.findByIdAndUpdate with correct params', async () => {
    const entityName = new EntityName(updateEntityNameDTO)

    await sut.handle(updateEntityNameDTO)

    expect(entityNameAccountRepo.findByIdAndUpdate).toHaveBeenCalledWith(
      updateEntityNameDTO.id,
      entityName
    )
    expect(entityNameAccountRepo.findByIdAndUpdate).toHaveBeenCalledTimes(1)
  })

  it('should throw if EntityNameAccountRepo does not find any collection to update', async () => {
    entityNameAccountRepo.findByIdAndUpdate.mockResolvedValueOnce(null)

    const promise = sut.handle(updateEntityNameDTO)

    expect(promise).rejects.toThrow(new Error('not_found'))
  })

  it('should rethrow if EntityNameAccountRepo.update throws', async () => {
    entityNameAccountRepo.findByIdAndUpdate.mockRejectedValueOnce(
      new Error('repo_error')
    )

    const promise = sut.handle(updateEntityNameDTO)

    await expect(promise).rejects.toThrow(new Error('repo_error'))
  })
})
