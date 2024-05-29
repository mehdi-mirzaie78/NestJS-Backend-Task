import { Schema } from 'mongoose';

export const AvatarSchema = new Schema({
  userId: Number,
  hash: String,
  filePath: String,
});
