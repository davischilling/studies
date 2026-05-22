import { makeLocalStorageAdapter } from '@/main/factories/infra/cache'
import { AccountModel } from '@/domain/models'

export const setCurrentAccountAdapter = (account: AccountModel): void => {
  makeLocalStorageAdapter().set('account', account)
}

export const getCurrentAccountAdapter = (): AccountModel => {
  return makeLocalStorageAdapter().get('account')
}
