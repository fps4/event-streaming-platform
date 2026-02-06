import mongoose, { Connection, Model, Document } from 'mongoose';

export interface ClientDocument extends Document<string> {
  _id: string;
  name?: string;
  status: 'active' | 'inactive';
  secretHash: string;
  secretSalt?: string | null;
  allowedScopes: string[];
  allowedTopics?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}

export const clientSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  name: { type: String, default: '' },
  status: { type: String, enum: ['active', 'inactive'], default: 'active', index: true },
  secretHash: { type: String, required: true },
  secretSalt: { type: String, default: null },
  allowedScopes: { type: [String], default: [] },
  allowedTopics: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

export function getClientModel(connection: Connection): Model<ClientDocument> {
  return (connection.models.Client as Model<ClientDocument>) ||
    connection.model<ClientDocument>('Client', clientSchema);
}

export const Client: Model<ClientDocument> = (mongoose.models.Client as Model<ClientDocument>) ||
  mongoose.model<ClientDocument>('Client', clientSchema);
