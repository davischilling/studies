import { HttpStatusCode } from '@/data/contracts'
import { InvalidCredentialsError, UnexpectedError } from '@/data/errors'
import { AccountModel } from '@/domain/models'
import { mockAccountModel } from '@/tests/domain/mocks/mock-account'
import { mockAuthenticationParams } from '@/tests/domain/mocks'
import { RemoteAuthentication } from '@/data/services'

import faker from 'faker'
import { HttpClientSpy } from '@/tests/data/mocks'

type SutTypes = {
  sut: RemoteAuthentication
  httpClientSpy: HttpClientSpy<AccountModel>
}

const makeSut = (url: string): SutTypes => {
  const httpClientSpy = new HttpClientSpy<RemoteAuthentication.Model>()
  const sut = new RemoteAuthentication(url, httpClientSpy)
  return {
    sut,
    httpClientSpy
  }
}

describe('RemoteAuthentication', () => {
  let url: string

  beforeEach(() => {
    url = faker.internet.url()
  })

  test('should call HttpClient with correct URL', async () => {
    const { sut, httpClientSpy } = makeSut(url)

    await sut.auth(mockAuthenticationParams())

    expect(httpClientSpy.url).toBe(url)
  })

  test('should call HttpClient with correct body', async () => {
    const { sut, httpClientSpy } = makeSut(url)
    const authParams = mockAuthenticationParams()

    await sut.auth(authParams)

    expect(httpClientSpy.body).toEqual(authParams)
  })

  test('should throw InvalidCredentialsError if HttpClient returns 401', async () => {
    const { sut, httpClientSpy } = makeSut(url)
    httpClientSpy.response = {
      statusCode: HttpStatusCode.unauthorized
    }

    const promise = sut.auth(mockAuthenticationParams())

    await expect(promise).rejects.toThrow(new InvalidCredentialsError())
  })

  test('should throw UnexpectedError if HttpClient returns 400', async () => {
    const { sut, httpClientSpy } = makeSut(url)
    httpClientSpy.response = {
      statusCode: HttpStatusCode.badRequest
    }

    const promise = sut.auth(mockAuthenticationParams())

    await expect(promise).rejects.toThrow(new UnexpectedError())
  })

  test('should throw UnexpectedError if HttpClient returns 404', async () => {
    const { sut, httpClientSpy } = makeSut(url)
    httpClientSpy.response = {
      statusCode: HttpStatusCode.notFound
    }

    const promise = sut.auth(mockAuthenticationParams())

    await expect(promise).rejects.toThrow(new UnexpectedError())
  })

  test('should throw UnexpectedError if HttpClient returns 500', async () => {
    const { sut, httpClientSpy } = makeSut(url)
    httpClientSpy.response = {
      statusCode: HttpStatusCode.serverError
    }

    const promise = sut.auth(mockAuthenticationParams())

    await expect(promise).rejects.toThrow(new UnexpectedError())
  })

  test('should return an AccountModel if HttpClient returns 200', async () => {
    const { sut, httpClientSpy } = makeSut(url)
    const httpResult = mockAccountModel()
    httpClientSpy.response = {
      statusCode: HttpStatusCode.ok,
      body: httpResult
    }

    const account = await sut.auth(mockAuthenticationParams())

    expect(account).toEqual(httpResult)
  })
})
