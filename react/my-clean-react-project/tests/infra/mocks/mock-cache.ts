import { GetStorage, SetStorage } from '@/data/contracts'

import faker from 'faker'

export class GetStorageSpy implements SetStorage, GetStorage {
  key: string
  value: any = faker.random.objectElement()

  get (key: string): any {
    this.key = key
    return this.value
  }

  set (key: string, value: object): void {}
}
