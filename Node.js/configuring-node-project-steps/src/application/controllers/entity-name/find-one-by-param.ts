import { Controller, HttpResponse } from '@/application/controllers/Controller'
import { IFindOneByParamEntityNameService } from '@/domain/use-cases/entity-name'

export class FindOneByParamEntityNameController extends Controller {
  constructor(
    private readonly findOneByParamEntityNameService: IFindOneByParamEntityNameService
  ) {
    super()
  }
  async perform(httpRequest: any): Promise<HttpResponse> {
    const entityName = await this.findOneByParamEntityNameService.handle(
      httpRequest
    )
    return {
      statusCode: 200,
      data: entityName,
    }
  }
}
