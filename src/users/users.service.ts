import { Injectable, HttpException, Inject } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User } from './interfaces/user.interface';
import { Avatar } from './interfaces/avatar.interface';
import { ClientProxy } from '@nestjs/microservices';
import { createHash } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { lastValueFrom } from 'rxjs';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel('User') private readonly userModel: Model<User>,
    @InjectModel('Avatar') private readonly avatarModel: Model<Avatar>,
    @Inject('USER_SERVICE') private readonly client: ClientProxy,
    private readonly httpService: HttpService,
  ) {}

  async createUser(userDto: any): Promise<User> {
    // I wrote this part because I didn't want to store one user multiple times
    // const userExists = await this.userModel.findOne({ email: userDto.email });
    // if (userExists) throw new HttpException('User already exists', 400);

    const createdUser = new this.userModel(userDto);
    await createdUser.save();

    this.client.emit(
      'user_messages',
      this.transformUserResponse(createdUser.toObject()),
    );

    this.client.emit('send_email', {
      email: createdUser.email,
      subject: 'Welcome',
      message: 'Welcome to our platform!',
    });

    return this.transformUserResponse(createdUser.toObject());
  }

  async getUserById(userId: number): Promise<User> {
    try {
      const response = await lastValueFrom(
        this.httpService.get(`https://reqres.in/api/users/${userId}`),
      );

      if (!response.data) throw new HttpException('User not found', 404);

      return response.data.data;
    } catch (error) {
      throw new HttpException('Something went wrong', 400);
    }
  }

  async getUserAvatar(userId: number): Promise<string> {
    const avatarEntry = await this.avatarModel.findOne({ userId });

    if (avatarEntry) {
      const filePath = path.resolve(
        __dirname,
        `../../uploads/${avatarEntry.hash}`,
      );
      return fs.readFileSync(filePath, 'base64');
    }

    const user = await this.getUserById(userId);
    const avatarUrl = user.avatar;
    const response = await lastValueFrom(
      this.httpService.get(avatarUrl, { responseType: 'arraybuffer' }),
    );
    const buffer = Buffer.from(response.data, 'binary');

    const hash = createHash('md5').update(buffer).digest('hex');
    const filePath = path.resolve(__dirname, `../../uploads/${hash}`);

    fs.writeFileSync(filePath, buffer);

    const avatar = new this.avatarModel({ userId, hash, filePath });
    await avatar.save();

    return buffer.toString('base64');
  }

  async deleteUserAvatar(userId: number): Promise<void> {
    const avatarEntry = await this.avatarModel.findOneAndDelete({ userId });

    if (avatarEntry) {
      fs.unlinkSync(avatarEntry.filePath);
    }
  }

  private transformUserResponse(user: any): any {
    const { _id, __v, ...rest } = user;
    return { ...rest, id: _id };
  }
}
