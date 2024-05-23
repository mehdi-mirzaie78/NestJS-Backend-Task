import { Document } from 'mongoose';

export interface User extends Document {
  readonly id: number | string;
  readonly email: string;
  readonly first_name: string;
  readonly last_name: string;
  readonly avatar: string;
}
