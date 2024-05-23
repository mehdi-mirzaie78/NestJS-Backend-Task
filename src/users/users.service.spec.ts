import { HttpService } from '@nestjs/axios';
import { getModelToken } from '@nestjs/mongoose';
import { Test, TestingModule } from '@nestjs/testing';
import axios, { AxiosRequestConfig } from 'axios';
import { Model } from 'mongoose';
import { from, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Avatar, User } from './interfaces';
import { UsersService } from './users.service';
import { ClientProxy } from '@nestjs/microservices';
import * as fs from 'fs';

jest.mock('fs', () => ({
  ...jest.requireActual('fs'),
  readFileSync: jest.fn(() => 'mocked file content'),
  unlinkSync: jest.fn(),
}));

const createMockUser = {
  email: 'george.bluth@reqres.in',
  first_name: 'George',
  last_name: 'Bluth',
  avatar: 'https://reqres.in/img/faces/1-image.jpg',
};

const mockUser = {
  id: 1,
  email: 'george.bluth@reqres.in',
  first_name: 'George',
  last_name: 'Bluth',
  avatar: 'https://reqres.in/img/faces/1-image.jpg',
};

const mockAvatar = {
  userId: 1,
  hash: 'bfd5431ce374f33ce84a5e45def3a42c',
  filePath: '../uploads/bfd5431ce374f33ce84a5e45def3a42c',
};

const mockUserModel = {
  findOne: jest.fn(),
  create: jest.fn((data) => ({
    id: data.id,
    email: data.email,
    first_name: data.first_name,
    last_name: data.last_name,
    avatar: data.avatar,
  })),
};

const mockAvatarModel = {
  findOne: jest.fn(),
  findOneAndDelete: jest.fn(),

  create: jest.fn((data) => ({
    userId: data.userId,
    hash: data.hash,
    filePath: data.filePath,
  })),
};

const mockHttpService = {
  get: jest
    .fn()
    .mockImplementation((url: string, config?: AxiosRequestConfig) => {
      if (config?.responseType === 'arraybuffer') {
        let response = from(
          axios.get(url, { responseType: 'arraybuffer' }),
        ).pipe(map((res) => ({ data: res.data })));
        return response;
      } else {
        return of({ data: { data: mockUser } });
      }
    }),
};

const mockrabbitMQService = {
  emit: jest.fn(),
};

describe('UsersService', () => {
  let service: UsersService;
  let httpService: HttpService;
  let userModel: Model<User>;
  let avatarModel: Model<Avatar>;
  let client: ClientProxy;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: getModelToken('User'), useValue: mockUserModel },
        { provide: getModelToken('Avatar'), useValue: mockAvatarModel },
        { provide: HttpService, useValue: mockHttpService },
        { provide: 'USER_SERVICE', useValue: mockrabbitMQService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    httpService = module.get<HttpService>(HttpService);
    userModel = module.get<Model<User>>(getModelToken('User'));
    avatarModel = module.get<Model<Avatar>>(getModelToken('Avatar'));
    client = module.get<ClientProxy>('USER_SERVICE');
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    it('should create a new user', async () => {
      const result = await service.createUser(createMockUser);
      expect(result).toHaveProperty('first_name', createMockUser.first_name);
      expect(result).toHaveProperty('last_name', createMockUser.last_name);
    });
  });

  describe('getUserById', () => {
    it('should return user data by id', async () => {
      const userId = 1;
      const result = await service.getUserById(userId);
      expect(result).toEqual(mockUser);
    });

    it('should throw an error if the user is not found', async () => {
      mockHttpService.get.mockReturnValueOnce(of({ data: null }));
      await expect(service.getUserById(999)).rejects.toThrow(
        'Something went wrong',
      );
    });

    it('should throw an error if something goes wrong', async () => {
      mockHttpService.get.mockImplementationOnce(() => {
        throw new Error();
      });
      await expect(service.getUserById(1)).rejects.toThrow(
        'Something went wrong',
      );
    });
  });

  describe('getUserAvatar', () => {
    it('should return user avatar', async () => {
      const userId = 1;
      const result = await service.getUserAvatar(userId);
      expect(result).toBeDefined();
    });

    it("should return the user's avatar if it is stored locally", async () => {
      const userId = 1;
      const base64Avatar = 'base64Avatar';

      mockAvatarModel.findOne.mockResolvedValue(mockAvatar);
      (
        fs.readFileSync as jest.MockedFunction<typeof fs.readFileSync>
      ).mockReturnValue(base64Avatar);

      const result = await service.getUserAvatar(userId);

      expect(result).toBeDefined();
      expect(result).toEqual(base64Avatar);
      expect(mockAvatarModel.findOne).toBeCalledWith({ userId });
    });
  });

  describe('deleteUserAvatar', () => {
    it('should delete user avatar', async () => {
      const userId = 2;
      const filePath = '../uploads/bfd5431ce374f33ce84a5e45def3a42c';
      await service.getUserAvatar(userId);

      const findOneAndDeleteSpy = jest
        .spyOn(avatarModel, 'findOneAndDelete')
        .mockResolvedValue({ filePath: filePath });

      (
        fs.unlinkSync as jest.MockedFunction<typeof fs.unlinkSync>
      ).mockReturnValue(undefined);
      const unlinkSyncSpy = jest.spyOn(fs, 'unlinkSync');

      await service.deleteUserAvatar(userId);

      expect(findOneAndDeleteSpy).toHaveBeenCalledWith({ userId });
      expect(unlinkSyncSpy).toHaveBeenCalledWith(filePath);
    });
  });
});
