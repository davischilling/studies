import { adaptExpressRoute as adaptCtrl } from '@/main/adapters/express-router'
import {
  makeCreateEntityNameController,
  makeFindAllEntityNameController,
  makeFindByIdEntityNameController,
  makeFindOneByParamEntityNameController,
  makeUpdateEntityNameController,
  makeDeleteEntityNameController,
} from '@/main/factories/controllers'
import { Router } from 'express'

const entityNameRoutes = async (router: Router) => {
  router.get('/entities', adaptCtrl(await makeFindAllEntityNameController()))

  router.get(
    '/entities/params',
    adaptCtrl(await makeFindOneByParamEntityNameController())
  )

  router.get(
    '/entities/:id',
    adaptCtrl(await makeFindByIdEntityNameController())
  )

  router.post('/entities', adaptCtrl(await makeCreateEntityNameController()))

  router.put('/entities/:id', adaptCtrl(await makeUpdateEntityNameController()))

  router.delete(
    '/entities/:id',
    adaptCtrl(await makeDeleteEntityNameController())
  )
}

export default entityNameRoutes
