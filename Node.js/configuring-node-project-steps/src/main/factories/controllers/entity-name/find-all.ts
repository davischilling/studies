import { FindAllEntityNameController } from '@/application/controllers/entity-name'
import { makeFindAllEntityNameService } from '@/main/factories/services'

export const makeFindAllEntityNameController =
  async (): Promise<FindAllEntityNameController> => {
    const service = await makeFindAllEntityNameService()
    return new FindAllEntityNameController(service)
  }
