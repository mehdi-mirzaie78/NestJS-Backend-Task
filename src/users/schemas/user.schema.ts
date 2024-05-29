import { Schema } from 'mongoose';

export const UserSchema = new Schema({
  id: Number,
  email: String,
  name: String,
  avatar: String,
});
  