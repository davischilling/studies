import { IRepository } from '@/data/contracts'
import mongoose from 'mongoose'

export type RepoAttrs = {
  data: any
}

export interface IRepoDoc<T> extends mongoose.Document<T> {
  data: any
}

export type IRepoModel<T = any> = mongoose.Model<IRepoDoc<T>>

export class MongoDbRepository<T = any> implements IRepository<T> {
  constructor(readonly Schema: IRepoModel<T>) {}

  static async init<R = any>(
    path: string,
    entity: string
  ): Promise<MongoDbRepository<R>> {
    try {
      const Schema = (await import(`${path}/${entity}`)).default
      return new MongoDbRepository(Schema)
    } catch (err) {
      throw new Error('MongoDB_Error')
    }
  }

  static toDTO({ _doc }: any): any {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _id, __v, ...objAttrs } = _doc
    return objAttrs
  }

  async create(params: any): Promise<string | null> {
    const newEntity = new this.Schema(params)
    const newSavedEntity = await newEntity.save()
    return newSavedEntity.id
  }

  async find(params: any): Promise<{ items: number; data: any[] }> {
    const entities = await this.Schema.find(params)
    return {
      items: entities.length,
      data: entities.map((el) => MongoDbRepository.toDTO(el)),
    }
  }

  async findById(id: string): Promise<T | null> {
    const entity = await this.Schema.findOne({ id })
    if (!entity) {
      return null
    }
    return MongoDbRepository.toDTO(entity)
  }

  async findOneByParam(param: any): Promise<T | null> {
    const entity = await this.Schema.findOne(param)
    if (!entity) {
      return null
    }
    return MongoDbRepository.toDTO(entity)
  }

  async findByIdAndUpdate(id: string, updatedObj: any): Promise<string | null> {
    // console.log(id, updatedObj)

    const entity = await this.Schema.findOneAndUpdate({ id }, updatedObj)
    if (entity) {
      return entity.id
    }
    return null
  }

  async findByIdAndDelete(id: string): Promise<string | null> {
    const entity = await this.Schema.findOneAndDelete({ id })
    if (entity) {
      return entity.id
    }
    return null
  }
}
