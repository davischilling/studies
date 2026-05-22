import {
  Router,
  Express,
  // Request,
  // Response,
  // NextFunction
} from 'express'

export const apiRoutes = async (app: Express) => {
  const router = Router()

  ;(await import('@/main/routes/entity-name')).default(router)

  app.use(router)

  // app.use(
  //   // eslint-disable-next-line @typescript-eslint/no-unused-vars
  //   async (error: Error, req: Request, res: Response, _next: NextFunction) => {
  //     const errorMiddleware = makeErrorResponseMiddleware()
  //     const { statusCode, data } = errorMiddleware.execute(error)
  //     return res.status(statusCode).json({ error: data })
  //   }
  // )
}
