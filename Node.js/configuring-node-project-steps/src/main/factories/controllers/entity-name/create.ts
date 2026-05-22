import { CreateEntityNameController } from '@/application/controllers/entity-name'
import { makeCreateEntityNameService } from '@/main/factories/services'

export const makeCreateEntityNameController =
  async (): Promise<CreateEntityNameController> => {
    const service = await makeCreateEntityNameService()
    return new CreateEntityNameController(service)
  }
