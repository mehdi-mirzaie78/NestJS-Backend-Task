import { Document } from 'mongoose';

export interface Avatar extends Document {
  readonly userId: number;
  readonly hash: string;
  readonly filePath: string;
}
