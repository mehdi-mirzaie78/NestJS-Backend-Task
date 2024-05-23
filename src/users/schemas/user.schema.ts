import { Schema } from 'mongoose';

export const UserSchema = new Schema({
  id: Number,
  email: String,
  first_name: String,
  last_name: String,
  avatar: String,
});
