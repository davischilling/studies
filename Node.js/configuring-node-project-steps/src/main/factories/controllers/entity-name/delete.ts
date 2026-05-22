import { DeleteEntityNameController } from '@/application/controllers/entity-name'
import { makeDeleteEntityNameService } from '@/main/factories/services'

export const makeDeleteEntityNameController =
  async (): Promise<DeleteEntityNameController> => {
    const service = await makeDeleteEntityNameService()
    return new DeleteEntityNameController(service)
  }
