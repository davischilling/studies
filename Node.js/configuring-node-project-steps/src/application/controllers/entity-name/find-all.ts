import { Controller, HttpResponse } from '@/application/controllers/Controller'
import { IFindAllEntityNameService } from '@/domain/use-cases/entity-name'

export class FindAllEntityNameController extends Controller {
  constructor(
    private readonly findAllEntityNameService: IFindAllEntityNameService
  ) {
    super()
  }
  async perform(httpRequest?: any): Promise<HttpResponse> {
    const entityName = await this.findAllEntityNameService.handle(httpRequest)
    return {
      statusCode: 200,
      data: entityName,
    }
  }
}
