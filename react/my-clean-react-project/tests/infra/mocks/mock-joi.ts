import { ValidationResponse } from '@/data/contracts'

import faker from 'faker'

export const mockValidationResponse = (): ValidationResponse => ({
  value: faker.random.words()
})
