import { Document } from 'mongoose';

export interface User extends Document {
  readonly id: number | string;
  readonly email: string;
  readonly name: string;
  readonly avatar: string;
}
