import { Controller, HttpResponse } from '@/application/controllers/Controller'
import { IFindByIdEntityNameService } from '@/domain/use-cases/entity-name'

export class FindByIdEntityNameController extends Controller {
  constructor(
    private readonly findByIdEntityNameService: IFindByIdEntityNameService
  ) {
    super()
  }
  async perform(httpRequest: any): Promise<HttpResponse> {
    const entityName = await this.findByIdEntityNameService.handle(httpRequest)
    return {
      statusCode: 200,
      data: entityName,
    }
  }
}
