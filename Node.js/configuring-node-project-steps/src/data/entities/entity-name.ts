import { EntityNameModel } from '@/domain/models'
import { v4 as uuid } from 'uuid'

class EntityName implements EntityNameModel {
  id?: string
  example: string

  constructor({ id, example }: EntityNameModel) {
    if (!id) {
      this.id = uuid()
    } else {
      this.id = id
    }
    this.example = example
  }
}

export default EntityName
