import { HttpResponse, Controller } from '@/application/controllers/Controller'
import { ICreateEntityNameService } from '@/domain/use-cases/entity-name'

export class CreateEntityNameController extends Controller {
  constructor(
    private readonly createEntityNameService: ICreateEntityNameService
  ) {
    super()
  }
  async perform(httpRequest: any): Promise<HttpResponse> {
    await this.createEntityNameService.handle(httpRequest)
    return {
      statusCode: 201,
      data: { message: 'entityName created' },
    }
  }
}
