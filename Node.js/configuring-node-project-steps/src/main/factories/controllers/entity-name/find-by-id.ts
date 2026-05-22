import { FindByIdEntityNameController } from '@/application/controllers/entity-name'
import { makeFindByIdEntityNameService } from '@/main/factories/services'

export const makeFindByIdEntityNameController =
  async (): Promise<FindByIdEntityNameController> => {
    const service = await makeFindByIdEntityNameService()
    return new FindByIdEntityNameController(service)
  }
