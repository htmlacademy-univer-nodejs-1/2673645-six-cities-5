import { Request } from 'express';
import { IUser } from '../db/models/user.schema.js';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    email: string;
    type: string;
  };
}
