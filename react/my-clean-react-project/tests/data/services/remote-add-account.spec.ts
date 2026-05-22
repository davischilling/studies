import { HttpStatusCode } from '@/data/contracts'
import { EmailInUseError, UnexpectedError } from '@/data/errors'
import { HttpClientSpy } from '@/tests/data/mocks'
import { AccountModel } from '@/domain/models'
import { mockAddAccountParams } from '@/tests/domain/mocks'
import { mockAccountModel } from '@/tests/domain/mocks/mock-account'
import { RemoteAddAccount } from '@/data/services'

import faker from 'faker'

type SutTypes = {
  sut: RemoteAddAccount
  httpClientSpy: HttpClientSpy<AccountModel>
}

const makeSut = (url: string): SutTypes => {
  const httpClientSpy = new HttpClientSpy<RemoteAddAccount.Model>()
  const sut = new RemoteAddAccount(url, httpClientSpy)
  return {
    sut,
    httpClientSpy
  }
}

describe('RemoteAddAccount', () => {
  let url: string

  beforeEach(() => {
    url = faker.internet.url()
  })

  test('should call HttpClient with correct URL', async () => {
    const { sut, httpClientSpy } = makeSut(url)

    await sut.add(mockAddAccountParams())

    expect(httpClientSpy.url).toBe(url)
  })

  test('should call HttpClient with correct body', async () => {
    const { sut, httpClientSpy } = makeSut(url)
    const addAccountParams = mockAddAccountParams()

    await sut.add(addAccountParams)

    expect(httpClientSpy.body).toEqual(addAccountParams)
  })

  test('should throw EmailInUseError if HttpClient returns 403', async () => {
    const { sut, httpClientSpy } = makeSut(url)
    httpClientSpy.response = {
      statusCode: HttpStatusCode.forbidden
    }

    const promise = sut.add(mockAddAccountParams())

    await expect(promise).rejects.toThrow(new EmailInUseError())
  })

  test('should throw UnexpectedError if HttpClient returns 400', async () => {
    const { sut, httpClientSpy } = makeSut(url)
    httpClientSpy.response = {
      statusCode: HttpStatusCode.badRequest
    }

    const promise = sut.add(mockAddAccountParams())

    await expect(promise).rejects.toThrow(new UnexpectedError())
  })

  test('should throw UnexpectedError if HttpClient returns 404', async () => {
    const { sut, httpClientSpy } = makeSut(url)
    httpClientSpy.response = {
      statusCode: HttpStatusCode.notFound
    }

    const promise = sut.add(mockAddAccountParams())

    await expect(promise).rejects.toThrow(new UnexpectedError())
  })

  test('should throw UnexpectedError if HttpClient returns 500', async () => {
    const { sut, httpClientSpy } = makeSut(url)
    httpClientSpy.response = {
      statusCode: HttpStatusCode.serverError
    }

    const promise = sut.add(mockAddAccountParams())

    await expect(promise).rejects.toThrow(new UnexpectedError())
  })

  test('should return an AccountModel if HttpClient returns 200', async () => {
    const { sut, httpClientSpy } = makeSut(url)
    const httpResult = mockAccountModel()
    httpClientSpy.response = {
      statusCode: HttpStatusCode.ok,
      body: httpResult
    }

    const account = await sut.add(mockAddAccountParams())

    expect(account).toEqual(httpResult)
  })
})
