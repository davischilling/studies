import express from 'express'
import 'express-async-errors'
import swaggerIi from 'swagger-ui-express'

import { apiRoutes } from './routes'
import swaggerFile from './swagger.json'

const app = express()

app.use(express.json())
app.use('/api-docs', swaggerIi.serve, swaggerIi.setup(swaggerFile))

apiRoutes(app)

export { app }
