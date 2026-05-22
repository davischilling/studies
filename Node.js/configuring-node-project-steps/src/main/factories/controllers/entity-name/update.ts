import { UpdateEntityNameController } from '@/application/controllers/entity-name'
import { makeUpdateEntityNameService } from '@/main/factories/services'

export const makeUpdateEntityNameController =
  async (): Promise<UpdateEntityNameController> => {
    const service = await makeUpdateEntityNameService()
    return new UpdateEntityNameController(service)
  }
