export abstract class Service<ParamsType = any, ResponseType = any> {
  abstract perform(params: ParamsType): Promise<ResponseType>;

  async handle(params: ParamsType): Promise<ResponseType> {
    try {
      return await this.perform(params);
    } catch (err) {
      throw err;
    }
  }
}
