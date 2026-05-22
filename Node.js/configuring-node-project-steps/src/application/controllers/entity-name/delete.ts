import { Controller, HttpResponse } from '@/application/controllers/Controller'
import { IDeleteEntityNameService } from '@/domain/use-cases/entity-name'

export class DeleteEntityNameController extends Controller {
  constructor(
    private readonly deleteEntityNameService: IDeleteEntityNameService
  ) {
    super()
  }
  async perform(httpRequest: any): Promise<HttpResponse> {
    await this.deleteEntityNameService.handle(httpRequest)
    return {
      statusCode: 200,
      data: { message: 'entityName deleted' },
    }
  }
}
