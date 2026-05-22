import { IRepository as EntityNameDbRepo } from '@/data/contracts'
import { DeleteEntityNameService } from '@/data/services/entity-name'
import { EntityNameModel } from '@/domain/models'
import {
  IDeleteEntityNameDTO,
  IDeleteEntityNameService,
} from '@/domain/use-cases/entity-name'
// eslint-disable-next-line import/no-extraneous-dependencies
import { mock, MockProxy } from 'jest-mock-extended'

describe('Delete EntityName', () => {
  let entityNameAccountRepo: MockProxy<EntityNameDbRepo<EntityNameModel>>
  let deleteEntityNameDTO: IDeleteEntityNameDTO
  let sut: IDeleteEntityNameService

  beforeAll(() => {
    deleteEntityNameDTO = {
      id: 'entityName_id',
    }
    entityNameAccountRepo = mock()
    entityNameAccountRepo.findByIdAndDelete.mockResolvedValue('entityName_id')
  })

  beforeEach(() => {
    sut = new DeleteEntityNameService(entityNameAccountRepo)
  })

  it('should call EntityNameRepo.findByIdAndDelete with correct params', async () => {
    await sut.handle(deleteEntityNameDTO)

    const { id } = deleteEntityNameDTO

    expect(entityNameAccountRepo.findByIdAndDelete).toHaveBeenCalledWith(id)
    expect(entityNameAccountRepo.findByIdAndDelete).toHaveBeenCalledTimes(1)
  })

  it('should throw if EntityNameAccountRepo does not find any collection to delete', async () => {
    entityNameAccountRepo.findByIdAndDelete.mockResolvedValueOnce(null)

    const promise = sut.handle(deleteEntityNameDTO)

    expect(promise).rejects.toThrow(new Error('not_found'))
  })

  it('should rethrow if EntityNameAccountRepo.delete throws', async () => {
    entityNameAccountRepo.findByIdAndDelete.mockRejectedValueOnce(
      new Error('repo_error')
    )

    const promise = sut.handle(deleteEntityNameDTO)

    await expect(promise).rejects.toThrow(new Error('repo_error'))
  })
})
