import { EntityNameModel } from '@/domain/models'
import mongoose from 'mongoose'

const entityNameSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    example: { type: String, required: true },
  },
  {
    timestamps: true,
  }
)

const EntityName = mongoose.model<EntityNameModel>(
  'EntityName',
  entityNameSchema
)

export default EntityName
