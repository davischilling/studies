import { Controller, HttpResponse } from '@/application/controllers/Controller'
import { IUpdateEntityNameService } from '@/domain/use-cases/entity-name'

export class UpdateEntityNameController extends Controller {
  constructor(
    private readonly updateEntityNameService: IUpdateEntityNameService
  ) {
    super()
  }
  async perform(httpRequest: any): Promise<HttpResponse> {
    await this.updateEntityNameService.handle(httpRequest)
    return {
      statusCode: 200,
      data: { message: 'entityName updated' },
    }
  }
}
