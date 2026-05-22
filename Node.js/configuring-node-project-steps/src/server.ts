import './main/config/module-alias'
import { app } from '@/main/config/app'
import { Express } from 'express'
import 'express-async-errors'
import mongoose from 'mongoose'

const start = async (app: Express): Promise<void> => {
  const port = process.env.PORT
  const mongo_uri = process.env.MONGO_URI
  const db_name = process.env.DB_NAME

  try {
    await mongoose.connect(`${mongo_uri}${db_name}`, {
      dbName: db_name,
      autoIndex: true,
    })
    console.log('Connected to mongodb')
    app.listen(port, () => {
      console.log(`Running server on port ${port}`)
    })
  } catch (err) {
    console.log(err)
  }
}

start(app)
