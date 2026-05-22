import { FindOneByParamEntityNameController } from '@/application/controllers/entity-name'
import { makeFindOneByParamEntityNameService } from '@/main/factories/services'

export const makeFindOneByParamEntityNameController =
  async (): Promise<FindOneByParamEntityNameController> => {
    const service = await makeFindOneByParamEntityNameService()
    return new FindOneByParamEntityNameController(service)
  }
